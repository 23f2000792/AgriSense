import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Good morning": "Good morning",
      "Synced": "Synced",
      "Offline Mode": "Offline Mode",
      "Today Plan": "Today Plan",
      "Map View": "Map View",
      "Insights": "Insights",
      "Profile": "Profile",
      "High Priority": "High Priority",
      "Medium Priority": "Medium Priority",
      "Low Priority": "Low Priority",
      "Start Visit": "Start Visit",
      "Navigate": "Navigate",
      "Why this is important:": "Why this is important:",
      "Recommended Action:": "Recommended Action:",
      "Sale Made": "Sale Made",
      "No Sale": "No Sale",
      "Add Notes": "Add Notes",
      "Focus more on cotton belt this week": "Focus more on cotton belt this week",
      "Retailer demand rising in Zone B": "Retailer demand rising in Zone B"
    }
  },
  hi: {
    translation: {
      "Good morning": "सुप्रभात",
      "Synced": "सिंक हो गया",
      "Offline Mode": "ऑफ़लाइन मोड",
      "Today Plan": "आज की योजना",
      "Map View": "मानचित्र",
      "Insights": "अंतर्दृष्टि",
      "Profile": "प्रोफ़ाइल",
      "High Priority": "उच्च प्राथमिकता",
      "Medium Priority": "मध्यम प्राथमिकता",
      "Low Priority": "कम प्राथमिकता",
      "Start Visit": "विजिट शुरू करें",
      "Navigate": "नेविगेट करें",
      "Why this is important:": "यह महत्वपूर्ण क्यों है:",
      "Recommended Action:": "सुझाई गई कार्रवाई:",
      "Sale Made": "बिक्री हुई",
      "No Sale": "बिक्री नहीं हुई",
      "Add Notes": "नोट्स जोड़ें",
      "Focus more on cotton belt this week": "इस सप्ताह कपास क्षेत्र पर अधिक ध्यान दें",
      "Retailer demand rising in Zone B": "ज़ोन बी में रिटेलर की मांग बढ़ रही है"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
