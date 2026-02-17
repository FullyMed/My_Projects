Overall (2000 users, threshold 8.0, seed_size=3) ;

- Recall@5 = 0.0478
- Recall@10 = 0.0783
- Recall@20 = 0.1155
- NDCG@5 = 0.1861
- NDCG@10 = 0.2348
- NDCG@20 = 0.2852

Meaning (simple) :
- In the Top-20 list, your model retrieves on average ~11.6% of the user’s held-out “high-rated” games.
- Ranking quality is decent-ish (NDCG rises with K), but not amazing.


Cold users (few ratings) have higher Recall, but lower NDCG ;
1. Cold :

- Recall@20 = 0.1973
- NDCG@20 = 0.1657

2. Non-cold :

- Recall@20 = 0.0990
- NDCG@20 = 0.3094

Why cold users get higher Recall :

Your holdout size for cold users is smaller (because they have fewer relevant items).
- Recall = hits / |holdout|, so it’s easier to score higher.

Why non-cold users get higher NDCG :
- Non-cold users have richer history and stronger “theme clusters,” so when your model hits, it tends to rank hits higher → better ranking quality.