import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  // --- THEME COLORS ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);
  final Color _alertRed = const Color(0xFFEF4444);
  final Color _safeGreen = const Color(0xFF10B981);

  // --- MASSIVE DATASET ---
  List<Map<String, dynamic>> _machines = [];

  // --- STATE ---
  late PageController _pageController;
  int _currentIndex = 0;

  Timer? _simulationTimer;
  Timer? _autoCycleTimer;
  List<double> _healthHistory = [];

  // Dynamic Variables
  double _currentHealth = 92.0;
  double _currentTemp = 62.0;
  double _currentVibration = 1.1;
  double _anomalyScore = 0.2;
  String _status = "OK";
  int _tickCounter = 0;
  bool _isSafeMode = false;

  List<Map<String, dynamic>> _logs = [];

  @override
  void initState() {
    super.initState();

    // 1. GENERATE 5,000 MACHINES
    _generateFleetData(5000);

    _pageController = PageController(initialPage: 0);
    _initializeMachine(0);

    // 2. SIMULATION LOOP (Graph Updates)
    _simulationTimer = Timer.periodic(const Duration(milliseconds: 800), (
      timer,
    ) {
      if (_isSafeMode) {
        _runSafeModeLogic();
      } else {
        _runNormalOperation();
      }
    });

    // 3. AUTO-CYCLE LOOP (Switch every 6 seconds)
    _autoCycleTimer = Timer.periodic(const Duration(seconds: 6), (timer) {
      // Only switch if NOT in emergency mode (so we can watch it cool down)
      if (!_isSafeMode) {
        int nextIndex = (_currentIndex + 1) % _machines.length;
        _pageController.animateToPage(
          nextIndex,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  // --- GENERATOR LOGIC ---
  void _generateFleetData(int count) {
    final random = Random();
    final types = ["GENERATOR", "TURBINE", "PRESS", "FAN", "PUMP", "ARM"];

    _machines = List.generate(count, (index) {
      String type = types[random.nextInt(types.length)];
      String id = (1000 + index).toString(); // e.g., 1000, 1001

      return {
        "name": "$type $id",
        "baseTemp": 40.0 + random.nextDouble() * 50.0,
        "baseVib": 0.5 + random.nextDouble() * 3.5,
        "resilience": 0.01 + random.nextDouble() * 0.1,
      };
    });
  }

  void _initializeMachine(int index) {
    final machine = _machines[index];
    setState(() {
      _currentIndex = index;
      _isSafeMode = false;
      _status = "OK";

      _currentTemp = machine["baseTemp"];
      _currentVibration = machine["baseVib"];
      _currentHealth = 90.0 + Random().nextDouble() * 9.0;

      _healthHistory = List.generate(
        20,
        (index) => 0.9 + (Random().nextDouble() * 0.05),
      );
      _logs = [
        {"time": _getTime(), "msg": "Monitoring ${machine['name']}"},
      ];
    });
  }

  @override
  void dispose() {
    _simulationTimer?.cancel();
    _autoCycleTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  // --- LOGIC: NORMAL OPERATION ---
  void _runNormalOperation() {
    final random = Random();
    _tickCounter++;

    final machine = _machines[_currentIndex];
    double baseVibConfig = machine["baseVib"];

    setState(() {
      // Vibration Simulation
      double baseVib = baseVibConfig + sin(_tickCounter * 0.5) * 0.5;
      double noise = (random.nextDouble() * 1.0) - 0.5;

      // --- NEW LOGIC: LOAD SPIKE = INSTANT COOL DOWN ---
      bool spikeDetected = false;
      if (random.nextInt(20) == 0) {
        // 1 in 20 chance
        baseVib += 10.0; // Huge visual spike
        spikeDetected = true;
        _logs.insert(0, {"time": _getTime(), "msg": "⚠️ LOAD SPIKE DETECTED"});
      }

      _currentVibration = (baseVib + noise).clamp(0.0, 18.0);

      // Temperature Logic
      if (_currentVibration > (baseVibConfig * 2)) {
        _currentTemp += 2.0;
      } else {
        _currentTemp -= 0.3;
      }

      _currentTemp = _currentTemp
          .clamp(20.0, (machine["baseTemp"] + 100).toDouble())
          .toDouble();

      // Anomaly Calculation
      _anomalyScore =
          (_currentVibration * 0.6) +
          ((_currentTemp - machine["baseTemp"]) * 0.1);

      // Health Decay
      if (_anomalyScore > 4.0) {
        _status = "WARNING";
        _currentHealth -= 0.8;
      } else {
        _status = "OK";
        _currentHealth -= machine["resilience"];
      }

      _updateChart();

      // --- IMMEDIATE TRIGGER ---
      // If we had a spike, trigger cooling AFTER updating the chart
      // (so the user sees the spike on the graph first)
      if (spikeDetected) {
        _activateCoolingMode(reason: "Automatic Spike Protection");
      }
    });
  }

  void _activateCoolingMode({String reason = "Manual Override"}) {
    // Only set state if not already mounted check is handled by Flutter usually,
    // but in a Timer callback, it's safer.
    _isSafeMode = true;
    _status = "COOLING";
    _logs.insert(0, {"time": _getTime(), "msg": "❄️ ACTIVE COOLING TRIGGERED"});
    _logs.insert(0, {"time": _getTime(), "msg": reason});
  }

  void _runSafeModeLogic() {
    setState(() {
      _currentVibration *= 0.5;
      if (_currentVibration < 0.1) _currentVibration = 0.0;

      _currentTemp *= 0.90; // Cool down fast

      double safeTemp = _machines[_currentIndex]["baseTemp"] + 5.0;
      if (_currentTemp < safeTemp) {
        _resetSystem(autoRestart: true);
      }
      _updateChart();
    });
  }

  void _updateChart() {
    _currentHealth = _currentHealth.clamp(0.0, 100.0);
    if (_healthHistory.length > 30) _healthHistory.removeAt(0);
    _healthHistory.add(_currentHealth / 100.0);
    if (_logs.length > 6) _logs.removeLast();
  }

  String _getTime() {
    final now = DateTime.now();
    return "${now.hour}:${now.minute}:${now.second}";
  }

  void _resetSystem({bool autoRestart = false}) {
    setState(() {
      _isSafeMode = false;
      _currentHealth = 98.0;
      _status = "OK";
      String msg = autoRestart ? "✅ Restarting Sequence..." : "♻️ Manual Reset";
      _logs.insert(0, {"time": _getTime(), "msg": msg});
    });
  }

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    if (_isSafeMode)
      statusColor = _safeGreen;
    else if (_status == "WARNING")
      statusColor = Colors.orange;
    else if (_status == "OK")
      statusColor = _geminiBlue;
    else
      statusColor = _alertRed;

    // Calc Cooling Progress
    double baseT = _machines.isNotEmpty
        ? _machines[_currentIndex]["baseTemp"]
        : 60.0;
    double progress = 0.0;
    if (_isSafeMode) {
      progress = 1.0 - ((_currentTemp - baseT) / 50.0).clamp(0.0, 1.0);
    }

    return Scaffold(
      backgroundColor: _bgDeep,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: _textDim, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          children: [
            Text(
              'FLEET AUTO-CYCLE',
              style: GoogleFonts.spaceMono(fontSize: 10, color: _textDim),
            ),
            const SizedBox(height: 4),
            // UNIT COUNTER
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                "UNIT ${_currentIndex + 1} / ${_machines.length}",
                style: GoogleFonts.spaceMono(
                  fontSize: 12,
                  color: _accentCyan,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              Icons.ac_unit,
              color: _isSafeMode ? _safeGreen : _accentCyan,
            ),
            onPressed: () =>
                _activateCoolingMode(reason: "Manual Cooling Request"),
          ),
        ],
      ),
      body: _machines.isEmpty
          ? Center(child: CircularProgressIndicator(color: _geminiBlue))
          : PageView.builder(
              controller: _pageController,
              itemCount: _machines.length,
              onPageChanged: (index) => _initializeMachine(index),
              itemBuilder: (context, index) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // --- HEADER ---
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              _machines[index]["name"],
                              style: GoogleFonts.spaceMono(
                                color: _accentCyan,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _isSafeMode
                                  ? _safeGreen.withOpacity(0.1)
                                  : _cardBg,
                              border: Border.all(
                                color: statusColor.withOpacity(0.5),
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  _isSafeMode ? "COOLING" : _status,
                                  style: TextStyle(
                                    color: statusColor,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Icon(Icons.circle, color: statusColor, size: 8),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // --- CHART ---
                      Container(
                        height: 220,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: _cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _isSafeMode
                                ? _safeGreen.withOpacity(0.3)
                                : Colors.white.withOpacity(0.05),
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'LIVE HEALTH FEED',
                                  style: TextStyle(
                                    color: _textDim,
                                    fontSize: 10,
                                  ),
                                ),
                                Icon(
                                  Icons.show_chart,
                                  color: statusColor,
                                  size: 16,
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Expanded(
                              child: CustomPaint(
                                size: Size.infinite,
                                painter: LineChartPainter(
                                  color: statusColor,
                                  dataPoints: _healthHistory,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // --- METRICS ---
                      Row(
                        children: [
                          Expanded(
                            child: _buildMetricBox(
                              'TEMPERATURE',
                              '${_currentTemp.toStringAsFixed(1)}°C',
                              'Core',
                              _currentTemp > 90 ? _alertRed : Colors.orange,
                              Icons.thermostat,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildMetricBox(
                              'VIBRATION',
                              '${_currentVibration.toStringAsFixed(2)} mm',
                              'Sensor 1',
                              _isSafeMode ? _safeGreen : _accentCyan,
                              Icons.vibration,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: _buildMetricBox(
                              'HEALTH',
                              '${_currentHealth.toStringAsFixed(1)}%',
                              _isSafeMode ? "SAFE" : "Running",
                              statusColor,
                              Icons.health_and_safety,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildMetricBox(
                              'ANOMALY',
                              _anomalyScore.toStringAsFixed(2),
                              'AI Score',
                              _anomalyScore > 4 ? _alertRed : _safeGreen,
                              Icons.graphic_eq,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 30),

                      // --- COOLING BANNER ---
                      if (_isSafeMode)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 20),
                          decoration: BoxDecoration(
                            color: _safeGreen.withOpacity(0.1),
                            border: Border.all(color: _safeGreen),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.ac_unit,
                                    color: _safeGreen,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    "ACTIVE COOLING...",
                                    style: GoogleFonts.spaceMono(
                                      color: _safeGreen,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              LinearProgressIndicator(
                                value: progress,
                                backgroundColor: _safeGreen.withOpacity(0.2),
                                color: _safeGreen,
                              ),
                            ],
                          ),
                        ),

                      Text(
                        'EVENT LOG',
                        style: GoogleFonts.spaceMono(
                          color: _textDim,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 15),
                      ..._logs.map((log) {
                        Color logColor = _geminiBlue;
                        if (log['msg'].contains("SPIKE")) logColor = _alertRed;
                        if (log['msg'].contains("COOLING"))
                          logColor = _safeGreen;
                        if (log['msg'].contains("Restart"))
                          logColor = _safeGreen;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: _cardBg,
                            borderRadius: BorderRadius.circular(8),
                            border: Border(
                              left: BorderSide(color: logColor, width: 3),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  log['msg'],
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              Text(
                                log['time'],
                                style: TextStyle(color: _textDim, fontSize: 10),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _buildMetricBox(
    String title,
    String value,
    String sub,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 18),
              Text(
                sub,
                style: TextStyle(
                  color: color,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.spaceMono(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: _textMain,
            ),
          ),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(color: _textDim, fontSize: 10)),
        ],
      ),
    );
  }
}

class LineChartPainter extends CustomPainter {
  final Color color;
  final List<double> dataPoints;
  LineChartPainter({required this.color, required this.dataPoints});

  @override
  void paint(Canvas canvas, Size size) {
    if (dataPoints.isEmpty) return;
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    final path = Path();
    double stepX = size.width / (dataPoints.length - 1);

    for (int i = 0; i < dataPoints.length; i++) {
      double val = dataPoints[i].clamp(0.0, 1.0);
      double x = i * stepX;
      double y = size.height - (val * size.height);
      if (i == 0)
        path.moveTo(x, y);
      else
        path.lineTo(x, y);
    }

    canvas.drawPath(
      path,
      Paint()
        ..color = color.withOpacity(0.3)
        ..strokeWidth = 6
        ..style = PaintingStyle.stroke
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10),
    );
    canvas.drawPath(path, paint);
    canvas.drawCircle(
      Offset(
        size.width,
        size.height - (dataPoints.last.clamp(0.0, 1.0) * size.height),
      ),
      4,
      Paint()..color = Colors.white,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
