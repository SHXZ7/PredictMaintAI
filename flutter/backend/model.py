import numpy as np

class AnomalyModel:
    def __init__(self):
        self.mean = None
        self.std = None
        self._is_fitted = False

    def fit(self, X):
        X = np.asarray(X, dtype=np.float64)
        self.mean = X.mean(axis=0)
        self.std = X.std(axis=0) + 1e-6
        self._is_fitted = True

    def score(self, x):
        if not self._is_fitted:
            raise RuntimeError("Model not trained yet")

        x = np.asarray(x, dtype=np.float64)
        z = (x - self.mean) / self.std

        # 🔥 Prevent runaway dominance
        z = np.clip(z, -6.0, 6.0)

        return float(np.linalg.norm(z))
