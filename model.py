import pandas as pd
df=pd.read_csv("data.csv")

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# === LOAD AND PREPARE DATA ===

# If year is already present
df['title_with_year'] = df['title'] + " (" + df['year'].astype(str) + ")"

# Combine text fields for TF-IDF
df['combined_features'] = df['overview'] + " " + df['genres']

# === TF-IDF + SVD for Content-Based Filtering ===
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['combined_features'])

svd = TruncatedSVD(n_components=100, random_state=42)
svd_matrix = svd.fit_transform(tfidf_matrix)

cosine_sim_content = cosine_similarity(svd_matrix, svd_matrix)

# === Index Mapping ===
indices = pd.Series(df.index, index=df['title_with_year'])

# === Normalize Popularity and Ratings ===
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

# === Helper: Handle Duplicate Titles ===
def get_matching_titles(title):
    matches = df[df['title'].str.lower() == title.lower()]

    if len(matches) > 1:
        options = matches[['title_with_year', 'rating']].drop_duplicates().reset_index(drop=True)
        print("Multiple movies found with that title. Please choose from the following:")
        print(options)

        # Ask the user to choose
        try:
            choice = int(input(f"Enter the number (0 to {len(options)-1}) of the correct movie: "))
            if 0 <= choice < len(options):
                return options['title_with_year'].iloc[choice]
            else:
                print("Invalid selection.")
                return None
        except ValueError:
            print("Invalid input.")
            return None
    elif len(matches) == 1:
        return matches['title_with_year'].iloc[0]
    else:
        print("Title not found.")
        return None


# === Recommendation Function ===
def tfidf_hybrid_recommend(title_with_year, alpha=0.6, beta=0.2, gamma=0.2, num_recommend=10, min_rating=7.0):
    if title_with_year not in indices:
        return "Movie not found."

    movie_idx = indices[title_with_year]
    input_genres = df['genres'].iloc[movie_idx]

    content_sim_scores = list(enumerate(cosine_sim_content[movie_idx]))
    content_sim_scores = sorted(content_sim_scores, key=lambda x: x[1], reverse=True)

    filtered_scores = [
        (i, score) for i, score in content_sim_scores
        if df['rating'].iloc[i] >= min_rating and input_genres in df['genres'].iloc[i]
    ]

    if not filtered_scores:
        return "No high-rated recommendations found."

    movie_indices = [i[0] for i in filtered_scores[:num_recommend+20]]
    content_scores = np.array([score[1] for score in filtered_scores[:num_recommend+20]])
    content_scores = content_scores / np.max(content_scores) if np.max(content_scores) > 0 else content_scores

    popularity_scores = df['popularity_norm'].iloc[movie_indices].to_numpy()
    rating_scores = df['weighted_rating_norm'].iloc[movie_indices].to_numpy()

    hybrid_scores = (alpha * content_scores) + (beta * popularity_scores) + (gamma * rating_scores)
    sorted_indices = np.argsort(hybrid_scores)[::-1]
    best_movies = np.array(movie_indices)[sorted_indices]

    return df[['title_with_year', 'rating']].iloc[best_movies[1:num_recommend+1]].reset_index(drop=True)

# === Example Usage ===
user_input = input("Enter a movie title: ")
selected_title = get_matching_titles(user_input)

if selected_title:
    recommendations = tfidf_hybrid_recommend(selected_title, alpha=0.5, beta=0.3, gamma=0.2, num_recommend=10, min_rating=6)
    print("\nRecommended Movies:")
    print(recommendations)
