import { useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage } from 'firebase/storage';
import { useProxy } from 'valtio/utils';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Divider,
  AlertTitle,
  Alert,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Autocomplete,
} from '@mui/material';


let serviceAccountFirebase = {
  apiKey: "AIzaSyCWzeya7dZmsE7XkQvOECKEXXarsMKgmH4",
  authDomain: "test-firebase-987-12.firebaseapp.com",
  projectId: "test-firebase-987-12",
  storageBucket: "test-firebase-987-12.firebasestorage.app",
  messagingSenderId: "103938328487",
  appId: "1:103938328487:web:4981246a266858253d1882",
  measurementId: "G-7DM0BMGDZD"
};
const serviceAccount = {
  "type": "service_account",
  "project_id": "test-firebase-987-12",
  "private_key_id": "ed1a6c1dbca6a5b7b17814739b07b5916e9ab371",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWH6hJ9uN2diAU\n6906HPvDp6IF1BPdzfTPFLRyRtwHTCuUHCKBKP5aQp6amn58sel7ho/1EAOTtQ/V\nLaoyOGXuQ9dr8dwTv5W1TPj8g2CTXsfluS0uCSlD4JeYUaHKyWiMLvhzQ+fdVQJQ\nZRU/Ai9/DGMeGpfwrET5mOtkR2uacN/NXV0zcG35xDji3wenibH8msCpesZUUVPe\nbM1Qne5JG8cRFTvTXADX8vNik3Xm2fAo9LBWjmZGtuFqeIeNPedR6DtStrtxMdb/\nBNe1ubkexYO7AqvK1XJi21oOymobrwcmD97dlynxCO01KX2UGQm2WdYjlqW3tYKM\nExMG9n9dAgMBAAECggEAAKrn7xXE+ck+f7IzO2DRwXdpVZP8B99XhGRvzOy+94rb\nlpehMpPlJHTmt7FZnvE9usky87RRaTQm+3wr9qzJrJIrlBuUmxR9gVY0bzJy/6Kh\nBEICi7fdmBJAMWpiaGvJAVQ4KWvXHOU3Skw2YmmS/6tojQnPhXbpXs8vlLLK+W1K\niT3skp+Mz2aHArCCvDeqU5EAfPEICJ+Rpe+cV+0dF1vVkdwWDdURlivCZtCgqYNF\niyJDKxvRjE0bZ8YHCTlK4maPE1lOTambbsnlYaEp8C9+igCYvXsrzMiHDWD/l1SU\nfK1qRiJAvdOvawft/BVg00uL3ZBC8WrTv+MYrr1xwQKBgQD8DIeDesbiZDBfgGM5\nrdGEslTmvDwvnpl7bSMR4KKRlhKnM2hg1OqH0G9rhcj5R9PQvBRKoILKc8/8K5ch\nC47kAjQ1NIOaa0apmU/J4bdUltuBV2N9j0qIMmW3jgVQUpeSpqexrpa+zQTwNpvT\ncindsqWLdWbApyeqr5KJIWKS7QKBgQDZeu8jygxlObI87Hra2DnK3Acj6oFwTc+6\nKLc3NwfeZ4pCE4+68IIR/rpbSwFuqfcEm3mzwiwyBDIETImFg1wwYYXoKkAX4AcJ\n0ksu/y0dGR75aiI3vYh5fU8AlZZdcgM4dKvkP3bCvZUDMlHs712JjXhfAY05aIq1\n+YK/jo3gMQKBgFJFhLZWDTU4ntGNhtX89rbpvuzR5JNmoZK4PQpI2MfMxKnvDdMN\nrMBIORZPxRoZZ/pqafUyD38l7m3RjLMsoqeqUIBNc+ejvJz/fhvXoY/q7ht5+u+x\nJhLu4GTZ5sIhM3ibDYHiCzKcmVAPgy2xxhinh4HOAIxCA6CjTqGUVCjBAoGAULKb\nFc6dNtpn1s9w7s+Y8jsesycLDJ7y24LMKULUOqR02vvjM1yXBxJcGBAG4gdTT3RZ\nfmgoeg6weIPl65LInHMzeuhii/lm4zATEcdB+DAgHDBTrhc4Esx6ih73gokRxNsW\nBUW/TZeHOX5sg9x1+tpxtd8fhhPSlJ+W8nl1D6ECgYEAywkt6P8E7Zwke7InFJuS\n8kAhgnC4dcn9p9VqwCvjkCxst0K03tx9i3ezEPmeCOoxsCCA8wBepFlgzqhe6wlC\nSl5BVm+YYa/uL9KQCB5+Cvj4jovds+SuV4UuM2eZNd/gO6AlO3ZNdc/xJISwQA4l\nKisltesAZEdPQlnuFIJlTn0=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@test-firebase-987-12.iam.gserviceaccount.com",
  "client_id": "113166188292139842347",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40test-firebase-987-12.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}


async function getAccessToken() {
  try {
    async function jwtSign(payload, privateKeyPem) {
      const header = {
        alg: "RS256",
        typ: "JWT",
      };

      function base64UrlEncode(obj) {
        return btoa(JSON.stringify(obj))
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      }

      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const dataToSign = `${encodedHeader}.${encodedPayload}`;

      async function importPrivateKey(pem) {
        const binaryDer = atob(pem.replace(/-----.*?-----/g, "").replace(/\s/g, ""));
        const arrayBuffer = new Uint8Array(binaryDer.length);
        for (let i = 0; i < binaryDer.length; i++) {
          arrayBuffer[i] = binaryDer.charCodeAt(i);
        }
        return await window.crypto.subtle.importKey(
          "pkcs8",
          arrayBuffer.buffer,
          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
          false,
          ["sign"]
        );
      }

      async function signRS256(data, privateKey) {
        const key = await importPrivateKey(privateKey);
        const signature = await window.crypto.subtle.sign(
          "RSASSA-PKCS1-v1_5",
          key,
          new TextEncoder().encode(data)
        );
        return btoa(String.fromCharCode(...new Uint8Array(signature)))
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      }

      return `${dataToSign}.${await signRS256(dataToSign, privateKeyPem)}`;
    }

    const token = await jwtSign(
      {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      },
      serviceAccount.private_key
    );

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
    });

    const data = await response.json();
    return data.access_token;
  } catch (e) {
    console.error("Error getting access token:", e);
    throw e;
  }
}


function convertFromFirestoreFields(doc) {
  if (doc.documents) {
    return doc.documents.map(item => convertFromFirestoreFields(item));
  }
  if (doc.fields) {
    let fields = doc.fields;
    const obj = {};

    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        const field = fields[key];

        if (field.stringValue !== undefined) {
          obj[key] = field.stringValue;
        } else if (field.integerValue !== undefined) {
          obj[key] = Number(field.integerValue);
        } else if (field.doubleValue !== undefined) {
          obj[key] = field.doubleValue;
        } else if (field.booleanValue !== undefined) {
          obj[key] = field.booleanValue;
        } else if (field.timestampValue !== undefined) {
          obj[key] = new Date(field.timestampValue);
        } else if (field.bytesValue !== undefined) {
          obj[key] = atob(field.bytesValue);
        } else if (field.referenceValue !== undefined) {
          obj[key] = field.referenceValue;
        } else if (field.geoPointValue !== undefined) {
          obj[key] = {
            latitude: field.geoPointValue.latitude,
            longitude: field.geoPointValue.longitude
          };
        } else if (field.arrayValue !== undefined && field.arrayValue.values) {
          obj[key] = field.arrayValue.values?.map(item => convertFromFirestoreFields({ fields: { value: item } }).value) || [];
        } else if (field.mapValue !== undefined) {
          obj[key] = convertFromFirestoreFields(field.mapValue);
        } else if (field.nullValue !== undefined) {
          obj[key] = null;
        }
      }
    }

    return obj;
  }
  return doc;
}

function convertToFirestoreFields(obj) {

  return convertToFirestoreFieldsInternal(obj).mapValue;
  function convertToFirestoreFieldsInternal(obj) {
    if (typeof obj === "string") {
      return { stringValue: obj };
    }
    if (typeof obj === "number") {
      return Number.isInteger(obj) ? { integerValue: obj.toString() } : { doubleValue: obj };
    }
    if (typeof obj === "boolean") {
      return { booleanValue: obj };
    }
    if (obj instanceof Date) {
      return { timestampValue: obj.toISOString() };
    }
    if (obj === null) {
      return { nullValue: null };
    }

    if (Array.isArray(obj)) {
      return {
        arrayValue: {
          values: obj.map(item => convertToFirestoreFieldsInternal(item)),
        },
      };
    }

    if (typeof obj === "object") {
      if ('latitude' in obj && 'longitude' in obj) {
        return { geoPointValue: obj };
      }
      return {
        mapValue: {
          fields: Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, convertToFirestoreFieldsInternal(value)])
          )
        }
      };
    }

    return null;
  }
}

function extractRoutine(json) {

  let currentDay = '';
  let timeSlots = [];
  let routine = [];

  function extractTimeSlots(headerRow) {
    return headerRow
      .slice(1)
      .filter((_, index) => index % 3 === 0);
  }

  function processRoomSchedule(roomRow) {
    const courses = [];
    for (let i = 1; i < roomRow.length; i += 3) { // i=1 changable
      if (roomRow[i]) {
        courses.push({
          timeSlotIndex: Math.floor((i - 1) / 3),
          course: roomRow[i],
          section: roomRow[i + 1],
          teacher: roomRow[i + 2]
        });
      }
    }
    return courses;
  }

  for (let i = 0; i < json.length; i++) {
    const row = json[i];

    if (row.find(cell => ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(cell?.toLowerCase?.()))) {
      currentDay = row[1].toUpperCase(); // maybe find first
      continue;
    }

    if (row.length > 1 && /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/.test(row[1])) {
      timeSlots = extractTimeSlots(row);
      continue;
    }

    if (row[0] && row[0] !== '' && currentDay) {
      const coursesInRoom = processRoomSchedule(row);
      coursesInRoom.forEach(course => {
        routine.push({
          day: currentDay,
          time: timeSlots[course.timeSlotIndex],
          course: course.course,
          section: course.section,
          teacher: course.teacher,
          room: row[0]
        });
      });
    }
  }

  return routine;
}

let loadPrefs = (async () => {
  let currentToken = localStorage.notificationToken;
  let data = await (await fetch(`https://test-firebase-987-12-default-rtdb.asia-southeast1.firebasedatabase.app/subscriptions/${currentToken}.json`)).json();
  if (!data) data = {
    enabled: false,
    tags: []
  }
  else data = (data);
  state.pushEnabled = (data.enabled);
  state.sectionTags = (data.tags?.section || []);
  state.courseTags = (data.tags?.course || []);
  state.teacherTags = (data.tags?.teacher || []);
});

const NotificationSettings = () => {
  const proxyState = useProxy(window.state);
  const [inputValues, setInputValues] = useState({
    section: '',
    course: '',
    teacher: ''
  });

  useEffect(() => {
    loadPrefs();
  }, []);

  const subscribeNotifications = async () => {
    const app = initializeApp(serviceAccountFirebase);
    const messaging = getMessaging(app);
    const vapidKey = 'BIpLhKhJvU2sqQqd6HJ7KR9SCpq03Qip2fJhI-kjVop9cprE5b_05y36yEJkfPWYteyBnpB1FtpOcqG3vTg_MP0';

    const currentToken = await getToken(messaging, { vapidKey });
    localStorage.notificationToken = currentToken;

    const permissionGranted = await Notification.requestPermission() === 'granted';
    if (!currentToken || !permissionGranted) return;

    const subscriptionData = {
      enabled: !!proxyState.pushEnabled,
      token: currentToken,
      tags: {
        section: proxyState.sectionTags,
        course: proxyState.courseTags,
        teacher: proxyState.teacherTags
      }
    };

    try {
      const endpoint = 'https://test-firebase-987-12-default-rtdb.asia-southeast1.firebasedatabase.app/subscriptions/';
      await fetch(`${endpoint}${currentToken}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });

      utils.notify('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      utils.notify('Failed to update settings', 'error');
    }
  };

  const handlePushToggle = async (event) => {
    const permissionGranted = await Notification.requestPermission() === 'granted';
    if (!permissionGranted) return utils.notify?.('Notification permission not granted', 'Change from Site Settings');
    proxyState.pushEnabled = !proxyState.pushEnabled;
    subscribeNotifications();
  };

  const handleInputChange = (field, value) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Extract unique values from routine data
  const getUniqueOptions = (field) => {
    const routineData = extractRoutine(proxyState.sheetData?.values || []);
    return [...new Set(routineData.map(item => item[field]))].sort();
  };

  // Tag selection change handler
  const handleTagsChange = async (field, newValue) => {
    proxyState[`${field}Tags`] = newValue;
    const permissionGranted = await Notification.requestPermission() === 'granted';
    if (!permissionGranted) return utils.notify?.('Notification permission not granted', 'Change from Site Settings');
    subscribeNotifications();
  };

  // Check if data is loaded
  const isLoading = proxyState.pushEnabled == null ||
    proxyState.sectionTags == null ||
    proxyState.courseTags == null ||
    proxyState.teacherTags == null;

  useEffect(() => {
    state.appBar = (
      <div className="bg-blue-600 px-6 py-4">
        <div className="w-full max-w-4xl mx-auto">
          <Typography variant="h5" className="text-white font-medium">
            Notification Preferences
          </Typography>
          <Typography variant="body2" className="text-blue-100 mt-1">
            Customize how and when you receive notifications
          </Typography>
        </div>
      </div>
    );
    return () => {
      state.appBar = null;
    }
  }, [])


  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const noTagsSelected = proxyState.pushEnabled &&
    proxyState.sectionTags?.length === 0 &&
    proxyState.courseTags?.length === 0 &&
    proxyState.teacherTags?.length === 0;


  return (
    <div className="bg-gray-50">
      <Paper elevation={0} className="max-w-3xl mx-auto rounded-lg overflow-hidden">

        <div className="p-6">
          {/* Main Toggle */}
          <Paper elevation={0} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" className="text-gray-800">
                  Push Notifications
                </Typography>
                <Typography variant="body2" className="text-gray-600 mt-1">
                  Receive alerts about schedule changes in real-time
                </Typography>
              </div>
              <Switch
                checked={proxyState.pushEnabled}
                onChange={handlePushToggle}
                color="primary"
              />
            </div>
          </Paper>

          {/* Alert when no tags selected */}
          {noTagsSelected && (
            <Alert
              severity="info"
              className="mb-6"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            >
              <AlertTitle>All Notifications Enabled</AlertTitle>
              Without selecting any filters below, you will receive notifications for all changes.
            </Alert>
          )}

          {proxyState.pushEnabled ? (
            <>
              <Typography variant="h6" className="text-gray-800 mb-4">
                Notification Filters
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-6">
                Select specific sections, courses, or instructors to receive targeted notifications.
              </Typography>

              {/* Filter Selections */}
              <div className="space-y-6">
                {/* Section Tags */}
                <div>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Section Filters
                  </Typography>
                  <Autocomplete
                    multiple
                    options={getUniqueOptions('section')}
                    value={proxyState.sectionTags || []}
                    onChange={(_, newValue) => handleTagsChange('section', newValue)}
                    inputValue={inputValues.section}
                    onInputChange={(_, value) => handleInputChange('section', value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          className="mr-2 mb-2"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select sections to monitor"
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </div>

                {/* Course Tags */}
                <div>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Course Filters
                  </Typography>
                  <Autocomplete
                    multiple
                    options={getUniqueOptions('course')}
                    value={proxyState.courseTags || []}
                    onChange={(_, newValue) => handleTagsChange('course', newValue)}
                    inputValue={inputValues.course}
                    onInputChange={(_, value) => handleInputChange('course', value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          className="mr-2 mb-2"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select courses to monitor"
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </div>

                {/* Teacher Tags */}
                <div>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Instructor Filters
                  </Typography>
                  <Autocomplete
                    multiple
                    options={getUniqueOptions('teacher')}
                    value={proxyState.teacherTags || []}
                    onChange={(_, newValue) => handleTagsChange('teacher', newValue)}
                    inputValue={inputValues.teacher}
                    onInputChange={(_, value) => handleInputChange('teacher', value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          className="mr-2 mb-2"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select instructors to monitor"
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </div>
              </div>

              <Divider className="my-6" />

              <Typography variant="body2" className="text-gray-500 italic mb-6">
                Changes to your notification settings are saved automatically.
              </Typography>
            </>
          ) : (
            <Paper elevation={0} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <Typography variant="h6" className="text-gray-700 mb-2">
                  Notifications Disabled
                </Typography>
                <Typography variant="body" className="text-gray-600 mx-auto ">
                  <div className='!max-w-md mx-auto'>
                    Enable push notifications to stay updated about schedule changes in real-time.
                  </div>
                </Typography>
              </div>
            </Paper>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default NotificationSettings;