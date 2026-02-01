from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from health import compute_fleet_health, compute_machine_health
from database import alerts_collection, predictions_collection
from datetime import datetime
import io
import json

router = APIRouter()

def generate_fleet_report():
    """Generate comprehensive fleet health report"""
    # Get fleet data
    fleet_data = compute_fleet_health()
    
    # Get recent alerts
    recent_alerts = list(alerts_collection.find(
        {"acknowledged": False},
        {"_id": 0}
    ).sort("created_at", -1).limit(10))
    
    for alert in recent_alerts:
        alert["created_at"] = str(alert["created_at"])
    
    # Build report content
    report = {
        "report_type": "Fleet Health Report",
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "fleet_health": fleet_data["fleet_health"],
            "total_machines": fleet_data["total_machines"],
            "critical_machines": fleet_data["critical_machines"],
            "warning_machines": fleet_data["warning_machines"],
            "healthy_machines": fleet_data["healthy_machines"],
            "total_alerts": fleet_data["total_unacknowledged_alerts"],
            "critical_alerts": fleet_data["total_critical_alerts"],
            "avg_anomaly_rate": fleet_data["avg_anomaly_rate"]
        },
        "machines": [],
        "recent_alerts": recent_alerts
    }
    
    # Add machine details
    for machine in fleet_data["machines"]:
        machine_detail = {
            "machine_id": machine["machine_id"],
            "health_score": machine["health_score"],
            "status": machine["status"],
            "health_trend": machine["health_trend"],
            "anomaly_rate": machine["anomaly_rate"],
            "unacknowledged_alerts": machine["unacknowledged_alerts"],
            "critical_alerts": machine["critical_alerts"],
            "explanation": machine.get("explanation", "N/A")
        }
        
        # Add prediction if available
        if machine.get("latest_prediction"):
            pred = machine["latest_prediction"]
            machine_detail["prediction"] = {
                "failure_probability": pred.get("failure_probability"),
                "time_to_failure_hours": pred.get("time_to_failure_hours"),
                "confidence": pred.get("confidence")
            }
        
        report["machines"].append(machine_detail)
    
    return report

def format_report_as_text(report):
    """Format report as plain text"""
    lines = []
    lines.append("=" * 80)
    lines.append(f"FLEET HEALTH REPORT")
    lines.append(f"Generated: {report['generated_at']}")
    lines.append("=" * 80)
    lines.append("")
    
    # Summary
    lines.append("FLEET SUMMARY")
    lines.append("-" * 80)
    summary = report["summary"]
    lines.append(f"Fleet Health: {summary['fleet_health']}%")
    lines.append(f"Total Machines: {summary['total_machines']}")
    lines.append(f"  - Healthy: {summary['healthy_machines']}")
    lines.append(f"  - Warning: {summary['warning_machines']}")
    lines.append(f"  - Critical: {summary['critical_machines']}")
    lines.append(f"Active Alerts: {summary['total_alerts']} ({summary['critical_alerts']} critical)")
    lines.append(f"Average Anomaly Rate: {summary['avg_anomaly_rate']}%")
    lines.append("")
    
    # Machines
    lines.append("MACHINE DETAILS")
    lines.append("-" * 80)
    for machine in report["machines"]:
        lines.append(f"\n{machine['machine_id']}")
        lines.append(f"  Status: {machine['status']}")
        lines.append(f"  Health Score: {machine['health_score']}%")
        lines.append(f"  Health Trend: {machine['health_trend']:+.1f}%")
        lines.append(f"  Anomaly Rate: {machine['anomaly_rate']}%")
        lines.append(f"  Active Alerts: {machine['unacknowledged_alerts']} ({machine['critical_alerts']} critical)")
        
        if machine.get("prediction"):
            pred = machine["prediction"]
            lines.append(f"  Prediction:")
            lines.append(f"    - Failure Probability: {pred['failure_probability']*100:.1f}%")
            lines.append(f"    - Time to Failure: {pred['time_to_failure_hours']}h")
            lines.append(f"    - Confidence: {pred['confidence']}%")
        
        lines.append(f"  AI Analysis: {machine['explanation']}")
    
    # Recent Alerts
    if report["recent_alerts"]:
        lines.append("\n")
        lines.append("RECENT ALERTS")
        lines.append("-" * 80)
        for alert in report["recent_alerts"][:5]:
            lines.append(f"\n{alert['machine_id']} - {alert['severity']}")
            lines.append(f"  {alert['message']}")
            lines.append(f"  Created: {alert['created_at']}")
    
    lines.append("\n" + "=" * 80)
    lines.append("End of Report")
    lines.append("=" * 80)
    
    return "\n".join(lines)

def generate_pdf_report(report):
    """Generate PDF report using reportlab"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
        from reportlab.lib.enums import TA_CENTER
        
        # Create PDF buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                               rightMargin=0.5*inch, leftMargin=0.5*inch,
                               topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        # Container for PDF elements
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=10,
            spaceBefore=20
        )
        
        # Title
        elements.append(Paragraph("FLEET HEALTH REPORT", title_style))
        elements.append(Paragraph(f"Generated: {report['generated_at']}", styles['Normal']))
        elements.append(Spacer(1, 0.3*inch))
        
        # Fleet Summary
        elements.append(Paragraph("Fleet Summary", heading_style))
        
        summary = report["summary"]
        summary_data = [
            ['Metric', 'Value'],
            ['Fleet Health', f"{summary['fleet_health']}%"],
            ['Total Machines', str(summary['total_machines'])],
            ['Healthy Machines', str(summary['healthy_machines'])],
            ['Warning Machines', str(summary['warning_machines'])],
            ['Critical Machines', str(summary['critical_machines'])],
            ['Total Active Alerts', str(summary['total_alerts'])],
            ['Critical Alerts', str(summary['critical_alerts'])],
            ['Avg Anomaly Rate', f"{summary['avg_anomaly_rate']}%"]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Machine Details
        elements.append(Paragraph("Machine Details", heading_style))
        
        for machine in report["machines"]:
            # Machine header
            machine_title = f"<b>{machine['machine_id']}</b> - {machine['status']}"
            elements.append(Paragraph(machine_title, styles['Heading3']))
            
            # Machine metrics
            machine_data = [
                ['Health Score', f"{machine['health_score']}%"],
                ['Health Trend', f"{machine['health_trend']:+.1f}%"],
                ['Anomaly Rate', f"{machine['anomaly_rate']}%"],
                ['Active Alerts', f"{machine['unacknowledged_alerts']} ({machine['critical_alerts']} critical)"]
            ]
            
            if machine.get('prediction'):
                pred = machine['prediction']
                machine_data.extend([
                    ['Failure Probability', f"{pred['failure_probability']*100:.1f}%"],
                    ['Time to Failure', f"{pred['time_to_failure_hours']}h"],
                    ['Prediction Confidence', f"{pred['confidence']}%"]
                ])
            
            machine_table = Table(machine_data, colWidths=[2.5*inch, 2.5*inch])
            machine_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'TOP')
            ]))
            elements.append(machine_table)
            
            # AI Analysis
            if machine.get('explanation'):
                elements.append(Spacer(1, 0.1*inch))
                elements.append(Paragraph(f"<b>AI Analysis:</b> {machine['explanation']}", styles['Normal']))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
        
    except ImportError:
        raise HTTPException(
            status_code=500, 
            detail="PDF generation requires reportlab. Install with: pip install reportlab"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

@router.get("/report/download")
async def download_fleet_report(format: str = "txt"):
    """
    Download fleet health report
    Supported formats: txt, json, pdf
    """
    try:
        print(f"📥 Generating report in {format} format...")
        
        # Generate report data
        report = generate_fleet_report()
        
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        if format == "json":
            # JSON format
            content = json.dumps(report, indent=2)
            filename = f"fleet_health_report_{timestamp}.json"
            media_type = "application/json"
            content_bytes = content.encode('utf-8')
            
        elif format == "pdf":
            # PDF format
            print("Generating PDF...")
            buffer = generate_pdf_report(report)
            content_bytes = buffer.read()
            filename = f"fleet_health_report_{timestamp}.pdf"
            media_type = "application/pdf"
            
        else:
            # Text format (default)
            content = format_report_as_text(report)
            filename = f"fleet_health_report_{timestamp}.txt"
            media_type = "text/plain"
            content_bytes = content.encode('utf-8')
        
        print(f"✅ Report generated: {filename} ({len(content_bytes)} bytes)")
        
        # Return as Response with proper headers
        return Response(
            content=content_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\"",
                "Content-Length": str(len(content_bytes)),
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        print(f"❌ Report generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")
