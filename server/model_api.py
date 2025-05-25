from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Allow requests from other domains (e.g., frontend or Node.js)

# === LOAD AND PREPARE DATA ===
df = pd.read_csv("./import/final_1.csv")
df['title_with_year'] = df['title'] + " (" + df['year'].astype(str) + ")"
df['combined_features'] = df['overview'] + " " + df['genres']

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['combined_features'])

svd = TruncatedSVD(n_components=100, random_state=42)
svd_matrix = svd.fit_transform(tfidf_matrix)

cosine_sim_content = cosine_similarity(svd_matrix, svd_matrix)
indices = pd.Series(df.index, index=df['title_with_year'])

df['popularity_norm'] = df['popularity'] / df['popularity'].max()
df['rating_norm'] = df['rating'] / df['rating'].max()
C = df['rating'].mean()
m = df['votes'].quantile(0.70)

def weighted_rating(row):
    v = row['votes']
    R = row['rating']
    return ((v / (v + m)) * R) + ((m / (m + v)) * C)

df['weighted_rating'] = df.apply(weighted_rating, axis=1)
df['weighted_rating_norm'] = df['weighted_rating'] / df['weighted_rating'].max()

def tfidf_hybrid_recommend(title_with_year, alpha=0.6, beta=0.2, gamma=0.2, num_recommend=10, min_rating=7.0):
    if title_with_year not in indices:
        return []

    movie_idx = indices[title_with_year]
    input_genres = df['genres'].iloc[movie_idx]

    content_sim_scores = list(enumerate(cosine_sim_content[movie_idx]))
    content_sim_scores = sorted(content_sim_scores, key=lambda x: x[1], reverse=True)

    filtered_scores = [
        (i, score) for i, score in content_sim_scores
        if df['rating'].iloc[i] >= min_rating and input_genres in df['genres'].iloc[i]
    ]

    if not filtered_scores:
        return []

    movie_indices = [i[0] for i in filtered_scores[:num_recommend+20]]
    content_scores = np.array([score[1] for score in filtered_scores[:num_recommend+20]])
    content_scores = content_scores / np.max(content_scores) if np.max(content_scores) > 0 else content_scores

    popularity_scores = df['popularity_norm'].iloc[movie_indices].to_numpy()
    rating_scores = df['weighted_rating_norm'].iloc[movie_indices].to_numpy()

    hybrid_scores = (alpha * content_scores) + (beta * popularity_scores) + (gamma * rating_scores)
    sorted_indices = np.argsort(hybrid_scores)[::-1]
    best_movies = np.array(movie_indices)[sorted_indices]

    recommendations = df[['title_with_year', 'rating']].iloc[best_movies[1:num_recommend+1]].reset_index(drop=True)
    return recommendations.to_dict(orient="records")


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    movie_title = data.get("title", "")
    
    if movie_title not in indices:
        return jsonify({"error": "Movie not found."}), 404

    results = tfidf_hybrid_recommend(movie_title, alpha=0.5, beta=0.3, gamma=0.2, num_recommend=10, min_rating=6)
    
    if not results:
        return jsonify({"error": "No suitable recommendations found."}), 200

    return jsonify({"recommendations": results})


if __name__ == "__main__":
    app.run(port=5001)

