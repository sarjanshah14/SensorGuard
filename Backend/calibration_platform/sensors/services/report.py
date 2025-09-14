import csv
import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sensors.models import Sensor, Reading, Calibration, Anomaly

# ---------- CSV ----------
def generate_csv_report(sensor_id):
    sensor = Sensor.objects.get(id=sensor_id)
    readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
    calibrations = Calibration.objects.filter(sensor=sensor).order_by('applied_at')
    anomalies = Anomaly.objects.filter(sensor=sensor).order_by('timestamp')

    filename = f"{sensor.name}_report.csv"
    output = BytesIO()
    writer = csv.writer(output)
    
    writer.writerow([f"Sensor Report: {sensor.name}"])
    writer.writerow([])
    writer.writerow(["Timestamp", "Raw Value"])
    for r in readings:
        writer.writerow([r.timestamp, r.raw_value])
    
    writer.writerow([])
    writer.writerow(["Calibrations"])
    writer.writerow(["Timestamp", "Method", "Corrected Value"])
    for c in calibrations:
        writer.writerow([c.applied_at, c.method, c.corrected_value])
    
    writer.writerow([])
    writer.writerow(["Anomalies"])
    writer.writerow(["Timestamp", "Type", "Confidence"])
    for a in anomalies:
        writer.writerow([a.timestamp, a.type, a.severity])

    output.seek(0)
    return output, filename

# ---------- EXCEL ----------
def generate_excel_report(sensor_id):
    sensor = Sensor.objects.get(id=sensor_id)
    readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
    calibrations = Calibration.objects.filter(sensor=sensor).order_by('applied_at')
    anomalies = Anomaly.objects.filter(sensor=sensor).order_by('timestamp')

    filename = f"{sensor.name}_report.xlsx"
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df_readings = pd.DataFrame(list(readings.values('timestamp', 'raw_value')))
        df_calibrations = pd.DataFrame(list(calibrations.values('applied_at', 'method', 'corrected_value')))
        df_anomalies = pd.DataFrame(list(anomalies.values('timestamp', 'type', 'severity')))

        df_readings.to_excel(writer, sheet_name='Readings', index=False)
        df_calibrations.to_excel(writer, sheet_name='Calibrations', index=False)
        df_anomalies.to_excel(writer, sheet_name='Anomalies', index=False)

        writer.save()
    
    output.seek(0)
    return output, filename

# ---------- PDF ----------
def generate_pdf_report(sensor_id):
    sensor = Sensor.objects.get(id=sensor_id)
    readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
    calibrations = Calibration.objects.filter(sensor=sensor).order_by('applied_at')
    anomalies = Anomaly.objects.filter(sensor=sensor).order_by('timestamp')

    filename = f"{sensor.name}_report.pdf"
    output = BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter
    y = height - 50

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, f"Sensor Report: {sensor.name}")
    y -= 30

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Readings:")
    y -= 20
    c.setFont("Helvetica", 10)
    for r in readings[:30]:  # limit to first 30 for demo
        c.drawString(50, y, f"{r.timestamp}: {r.raw_value}")
        y -= 15
        if y < 50:
            c.showPage()
            y = height - 50

    c.save()
    output.seek(0)
    return output, filename
