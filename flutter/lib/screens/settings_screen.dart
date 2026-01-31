import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // --- THEME COLORS ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _alertRed = const Color(0xFFEF4444);

  // --- SETTINGS STATE ---
  bool _notificationsEnabled = true;
  bool _soundEnabled = false;
  bool _hapticEnabled = true;
  bool _compactMode = false;
  double _refreshRate = 1.0; // 1 second

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgDeep,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: _textDim, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'SYSTEM CONFIG',
          style: GoogleFonts.spaceMono(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: _textMain,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // --- PROFILE CARD ---
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: _cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: _geminiBlue.withOpacity(0.2),
                  child: Icon(Icons.person, color: _geminiBlue),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Lead Engineer",
                      style: TextStyle(
                        color: _textMain,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      "ID: OP-4421-X",
                      style: GoogleFonts.spaceMono(
                        color: _textDim,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _accentCyan.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _accentCyan.withOpacity(0.3)),
                  ),
                  child: Text(
                    "ACTIVE",
                    style: TextStyle(
                      color: _accentCyan,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),

          // --- SECTION: ALERTS ---
          _buildSectionHeader("NOTIFICATIONS"),
          _buildSwitchTile(
            "Critical Alerts",
            "Push notifications for system failures",
            _notificationsEnabled,
            (v) => setState(() => _notificationsEnabled = v),
          ),
          _buildSwitchTile(
            "Sound Alerts",
            "Play siren on critical status",
            _soundEnabled,
            (v) => setState(() => _soundEnabled = v),
          ),
          _buildSwitchTile(
            "Haptic Feedback",
            "Vibrate on touch interactions",
            _hapticEnabled,
            (v) => setState(() => _hapticEnabled = v),
          ),

          const SizedBox(height: 30),

          // --- SECTION: DISPLAY ---
          _buildSectionHeader("DISPLAY & DATA"),
          _buildSwitchTile(
            "Compact Mode",
            "Reduce spacing for high density",
            _compactMode,
            (v) => setState(() => _compactMode = v),
          ),

          // Slider for Refresh Rate
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _cardBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Data Refresh Rate",
                      style: TextStyle(color: _textMain, fontSize: 14),
                    ),
                    Text(
                      "${_refreshRate.toStringAsFixed(1)}s",
                      style: GoogleFonts.spaceMono(
                        color: _accentCyan,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: _refreshRate,
                  min: 0.5,
                  max: 5.0,
                  divisions: 9,
                  activeColor: _accentCyan,
                  inactiveColor: Colors.white10,
                  onChanged: (val) => setState(() => _refreshRate = val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // --- LOGOUT BUTTON ---
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _alertRed.withOpacity(0.1),
                foregroundColor: _alertRed,
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: _alertRed.withOpacity(0.5)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Logged out successfully")),
                );
              },
              child: const Text(
                "DISCONNECT TERMINAL",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),

          const SizedBox(height: 20),
          Center(
            child: Text(
              "VERSION 1.0.4 (BETA)",
              style: GoogleFonts.spaceMono(color: Colors.white10, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title,
        style: GoogleFonts.spaceMono(
          color: _textDim,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    bool value,
    Function(bool) onChanged,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: SwitchListTile(
        activeColor: _accentCyan,
        activeTrackColor: _accentCyan.withOpacity(0.2),
        inactiveThumbColor: _textDim,
        inactiveTrackColor: Colors.white.withOpacity(0.05),
        title: Text(title, style: TextStyle(color: _textMain, fontSize: 14)),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: _textDim, fontSize: 11),
        ),
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}
