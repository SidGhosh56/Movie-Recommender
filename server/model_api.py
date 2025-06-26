from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson.objectid import ObjectId
import re
app = Flask(__name__)
CORS(app)  # Allow requests from other domains (e.g., frontend or Node.js)

client = MongoClient('mongodb://localhost:27017/')  # change this if using auth
db = client['CineVortex']   # example: 'movieDB'
movies_collection = db['movies']

def clean_text(text):
    return re.sub(r'\W+', ' ', str(text)).lower()

# === LOAD AND PREPARE DATA ===
df = pd.read_csv("./import/project.csv")
print(df.columns)
df['title_with_year'] = df['title'] + " (" + df['year'].astype(str) + ")"
df['title_clean'] = df['title_with_year'].apply(clean_text)
df['combined_features'] = (
    df['title_clean'] + " " +
    df['title_clean'] + " " +
    df['overview'].apply(clean_text) + " " +
    df['director'].apply(clean_text)
)

tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
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

def get_matching_titles(title):
    if not title:
        return []

    # Case-insensitive partial match using `str.contains`
    matches = df[df['title'].str.contains(title, case=False, na=False)]

    if matches.empty:
        return []
    else:
        return matches[['id', 'title_with_year', 'rating', 'poster_url']].drop_duplicates().to_dict(orient='records')


def tfidf_hybrid_recommend(title_with_year, alpha=0.6, beta=0.2, gamma=0.2, num_recommend=20, min_rating=7.0):
    if title_with_year not in indices:
        return []

    movie_idx = indices[title_with_year]
    input_genres = df['genres'].iloc[movie_idx]

    content_sim_scores = list(enumerate(cosine_sim_content[movie_idx]))
    content_sim_scores = sorted(content_sim_scores, key=lambda x: x[1], reverse=True)

    filtered_scores = [
        (i, score) for i, score in content_sim_scores
        if (
            df['rating'].iloc[i] >= 7 and
            df['votes'].iloc[i] >= 100 and
            input_genres in df['genres'].iloc[i]  # Optional: keep if genre relevance is needed
        )
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

    recommendations = df[['id', 'title_with_year', 'rating', 'poster_url']].iloc[best_movies[1:num_recommend+1]].reset_index(drop=True)
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

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "No title provided."}), 400

    matched_movies = get_matching_titles(title)
    if not matched_movies:
        return jsonify({"error": "No movies found with that title."}), 404

    return jsonify({"matches": matched_movies})

@app.route("/search_and_recommend", methods=["POST"])
def search_and_recommend():
    data = request.get_json()
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "No title provided."}), 400

    matched_movies = get_matching_titles(title)
    if not matched_movies:
        return jsonify({"error": "No movies found with that title."}), 404
    
    results = []
    for movie in matched_movies:
        title_with_year = movie['title_with_year']
        recs = tfidf_hybrid_recommend(title_with_year)
        results.append({
            "id": str(movie['id']),
            "title_with_year": title_with_year,
            "rating": movie['rating'],
            "poster_url": movie['poster_url'],
            "recommendations": recs
    })

    return jsonify({"matches": results})

@app.route("/search_and_recommend/<movie_id>", methods=["GET"])
def get_movie_by_id(movie_id):
    try:
        # First try to match the "id" field (your schema has id as String)
        movie = movies_collection.find_one({"id": movie_id})

        # If not found, try by _id (ObjectId), fallback
        if not movie:
            try:
                movie = movies_collection.find_one({"_id": ObjectId(movie_id)})
            except:
                pass  # Ignore if not a valid ObjectId

        if not movie:
            return jsonify({"error": "Movie not found."}), 404

        # Build response dict
        movie_data = {
            "id": movie.get('id'),
            "title": movie.get('title'),
            "overview": movie.get('overview'),
            "genres": movie.get('genres'),
            "director": movie.get('director'),
            "actors": movie.get('actors'),
            "characters": movie.get('characters'),
            "year": movie.get('year'),
            "rating": movie.get('rating'),
            "poster_url": movie.get('poster_url')
        }

        return jsonify(movie_data)

    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500
    
@app.route('/top_movies', methods=['GET'])
def top_movies():
    # Sort by rating, then votes (both descending)
    df_sorted = df.sort_values(by=['votes'], ascending=False)
    top_20 = df_sorted.head(20)

    movies = []
    for _, row in top_20.iterrows():
        movies.append({
            'id': row['id'], 
            'title': row['title'],
            'poster_url': row['poster_url'] if pd.notna(row['poster_url']) else 'default_poster.jpg',
            'year': row['year'] if pd.notna(row['year']) else 'N/A',
            'rating': round(row['rating'], 1) if pd.notna(row['rating']) else 'N/A'
        })

    return jsonify({'top_movies': movies})

    
if __name__ == "__main__":
    app.run(port=5001)

