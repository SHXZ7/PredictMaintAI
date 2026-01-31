import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'profile_screen.dart'; // Import the Profile Screen

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  // --- THEME COLORS (Matches Welcome Screen) ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgDeep,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _geminiBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.grid_view, color: _geminiBlue, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'COMMAND CENTER',
                  style: GoogleFonts.spaceMono(
                    color: _textMain,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                Text(
                  'Welcome, Engineer',
                  style: TextStyle(color: _textDim, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_none, color: _textDim),
            onPressed: () {},
          ),
          // --- PROFILE ICON WITH NAVIGATION ---
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ProfileScreen(),
                  ),
                );
              },
              child: CircleAvatar(
                radius: 16,
                backgroundColor: _geminiBlue.withOpacity(0.2),
                child: Icon(Icons.person, color: _accentCyan, size: 20),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- 1. SYSTEM OVERVIEW ROW ---
            Text(
              'SYSTEM METRICS',
              style: GoogleFonts.spaceMono(
                color: _textDim,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildDarkStatCard(
                    'ACTIVE',
                    '21',
                    _geminiBlue,
                    Icons.power,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildDarkStatCard(
                    'WARNING',
                    '03',
                    Colors.orange,
                    Icons.warning_amber,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildDarkStatCard(
                    'CRITICAL',
                    '01',
                    Colors.red,
                    Icons.error_outline,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 30),

            // --- 2. MAIN CHART / PERFORMANCE AREA ---
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'EFFICIENCY GRAPH',
                  style: GoogleFonts.spaceMono(
                    color: _textDim,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    border: Border.all(color: _accentCyan.withOpacity(0.5)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'LIVE: 98.4%',
                    style: GoogleFonts.spaceMono(
                      color: _accentCyan,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              height: 180,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildBar(0.4, _geminiBlue),
                  _buildBar(0.6, _geminiBlue),
                  _buildBar(0.5, _geminiBlue),
                  _buildBar(0.8, _accentCyan), // Peak
                  _buildBar(0.7, _geminiBlue),
                  _buildBar(0.3, Colors.orange), // Warning Dip
                  _buildBar(0.6, _geminiBlue),
                  _buildBar(0.9, _accentCyan),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // --- 3. ACTIVE MACHINES LIST ---
            Text(
              'UNIT STATUS LOG',
              style: GoogleFonts.spaceMono(
                color: _textDim,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),

            _buildMachineRow(
              'Hydraulic Press A1',
              'Sector 4',
              'OPERATIONAL',
              Colors.green,
            ),
            _buildMachineRow(
              'Turbine Gen X2',
              'Sector 9',
              'MAINTENANCE',
              Colors.orange,
            ),
            _buildMachineRow(
              'Cooling Fan B4',
              'Sector 2',
              'OFFLINE',
              Colors.red,
            ),
            _buildMachineRow(
              'Conveyor Belt M1',
              'Sector 1',
              'OPERATIONAL',
              Colors.green,
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: _bgDeep,
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
        ),
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(Icons.dashboard_rounded, true),
            _buildNavItem(Icons.analytics_outlined, false),
            _buildNavItem(Icons.history, false),
            _buildNavItem(Icons.settings_outlined, false),
          ],
        ),
      ),
    );
  }

  // --- WIDGET BUILDERS ---

  Widget _buildDarkStatCard(
    String label,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.spaceMono(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: _textMain,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 10, color: _textDim, letterSpacing: 1),
          ),
        ],
      ),
    );
  }

  Widget _buildBar(double heightPct, Color color) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: 20,
          height: constraints.maxHeight * heightPct,
          decoration: BoxDecoration(
            color: color.withOpacity(0.8),
            borderRadius: BorderRadius.circular(4),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.2),
                blurRadius: 8,
                spreadRadius: 1,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMachineRow(
    String name,
    String sector,
    String status,
    Color statusColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.precision_manufacturing_outlined,
              color: _textDim,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: GoogleFonts.spaceMono(
                    color: _textMain,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                Text(sector, style: TextStyle(color: _textDim, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: statusColor.withOpacity(0.3)),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: statusColor,
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, bool isActive) {
    return IconButton(
      icon: Icon(icon),
      color: isActive ? _geminiBlue : Colors.white24,
      onPressed: () {},
    );
  }
}
