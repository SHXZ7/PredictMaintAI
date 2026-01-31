import numpy as np

class HealthMonitor:
    def __init__(self, alpha=0.05):
        self.alpha = alpha
        self.ema = None

    def update(self, anomaly_score):
        if self.ema is None:
            self.ema = anomaly_score
        else:
            self.ema = self.alpha * anomaly_score + (1 - self.alpha) * self.ema

        # Map anomaly → health
        health = 1.0 / (1.0 + self.ema)

        return float(np.clip(health, 0.1, 1.0))

