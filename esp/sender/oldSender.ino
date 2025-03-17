#include <Wire.h>
#include "MAX30102.h"       // مكتبة مستشعر الأوكزيميتر
#include "spo2_algorithm.h"
#include "heartRate.h"
#include <TinyGPS++.h>

#include <Firebase_ESP_Client.h>

#define API_KEY "AIzaSyBWzI5cu4fP1XjNNWUjBo_iiVxc_geRn1Y"
#define DATABASE_URL "autisim-718d2-default-rtdb.asia-southeast1.firebasedatabase.app"

FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

// تعريف مستشعر الاهتزاز
#define VIBRATION_SENSOR_PIN 15

// إعداد مستشعر MAX30102
MAX30102 sensor;
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

// التخزين للبيانات المطلوبة لـ SpO2
uint32_t irBuffer[100];  // بيانات الأشعة تحت الحمراء
uint32_t redBuffer[100]; // بيانات الأشعة الحمراء
int32_t bufferLength = 100;
int32_t spo2;
int8_t validSPO2;
int32_t heartRate;
int8_t validHeartRate;

// إعداد GPS
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;
float latitude, longitude;

void setup() {
  Serial.begin(115200);

  // تهيئة مستشعر الاهتزاز
  pinMode(VIBRATION_SENSOR_PIN, INPUT);
  Serial.println("Vibration sensor initialized.");

  // بدء الـ I2C على ESP32 مع تحديد المنافذ (SDA = 21, SCL = 22)
  Wire.begin(21, 22);

  // تهيئة مستشعر MAX30102
  Serial.println("Initializing MAX30102 sensor...");
  if (!sensor.begin()) {
    Serial.println("MAX30102 not found. Check connections.");
    while (1);
  }
  sensor.setup();
  Serial.println("Place your finger on the sensor.");

  // تهيئة GPS
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  Serial.println("GPS initialized...");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // قراءة مستشعر الاهتزاز
  int vibrationState = digitalRead(VIBRATION_SENSOR_PIN);
  Serial.print("Vibration: ");
  Serial.println(vibrationState ? "Detected" : "No Vibration");

  // جمع 100 عينة من بيانات المستشعر
  for (byte i = 0; i < bufferLength; i++) {
    while (!sensor.available()) {
      sensor.check();
    }
    redBuffer[i] = sensor.getRed();
    irBuffer[i] = sensor.getIR();
    sensor.nextSample();
  }

  // حساب SpO2 ومعدل ضربات القلب
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

  Serial.print("SpO2: ");
  Serial.print(validSPO2 ? spo2 : 0);
  Serial.print("% | Heart Rate: ");
  Serial.print(validHeartRate ? heartRate : 0);
  Serial.println(" BPM");

  // قراءة بيانات GPS
  while (gpsSerial.available()) {
    int data = gpsSerial.read();
    if (gps.encode(data)) {
      latitude = gps.location.lat();
      longitude = gps.location.lng();
      Serial.print("Latitude: ");
      Serial.println(latitude, 6);
      Serial.print("Longitude: ");
      Serial.println(longitude, 6);
    }
  }

  if (Firebase.ready()) {
    if(validHeartRate) {
      if(!Firebase.RTDB.setInt(&fbdo, "readings/heartrate", heartRate))
        Serial.println("REASON: " + fbdo.errorReason());
    }
      
    if(validSPO2) {
      if(!Firebase.RTDB.setInt(&fbdo, "readings/spo2", spo2))
        Serial.println("REASON: " + fbdo.errorReason());
    }
      
    if(!Firebase.RTDB.setString(&fbdo, "readings/vibration", vibrationState ? "detected" : "undetected"))
      Serial.println("REASON: " + fbdo.errorReason());
      
    if(!Firebase.RTDB.setFloat(&fbdo, "readings/location/latitude", latitude))
      Serial.println("REASON: " + fbdo.errorReason());
    if(!Firebase.RTDB.setFloat(&fbdo, "readings/loation/longitude", longitude))
      Serial.println("REASON: " + fbdo.errorReason());
  }

  delay(1000);
}