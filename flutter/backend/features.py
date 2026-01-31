import numpy as np
from scipy.stats import kurtosis

def extract_features(signal, fs=20000):
    signal = np.asarray(signal, dtype=np.float64)

    # Root Mean Square
    rms = np.sqrt(np.mean(signal ** 2))

    # Kurtosis (fault-sensitive)
    k = kurtosis(signal)

    # High-frequency spectral energy (log compressed)
    fft = np.abs(np.fft.rfft(signal))
    freqs = np.fft.rfftfreq(len(signal), 1 / fs)
    hf_energy = np.sum(fft[freqs > 2000])
    hf_energy = np.log1p(hf_energy)

    return np.array([rms, k, hf_energy], dtype=np.float64)
