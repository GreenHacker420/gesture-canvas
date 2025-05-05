import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { createHandDetector } from './tensorflowInit';

// Interface for a single hand detection
export interface SingleHandDetection {
  isDetected: boolean;
  landmarks: { x: number; y: number; z: number; name: string }[] | null;
  confidence: number;
  indexFingerPosition: { x: number, y: number } | null;
  handedness: 'Left' | 'Right' | 'Unknown';
  gesture: {
    isDrawing: boolean;
    isClearCanvas: boolean;
    isChangeColor: boolean;
    isEraser: boolean;
  };
}

// Interface for multiple hand detection results
export interface HandDetection {
  isHandDetected: boolean;
  hands: SingleHandDetection[];
  landmarks: { x: number; y: number; z: number; name: string }[][] | null;
  handInViewConfidence: number;
  indexFingerPosition: { x: number, y: number } | null;
  gesture: {
    isDrawing: boolean;
    isClearCanvas: boolean;
    isChangeColor: boolean;
    isEraser: boolean;
  };
}

// Initialize hand tracking
export const initializeHandTracking = async (): Promise<handPoseDetection.HandDetector | null> => {
  console.log('Initializing hand pose detection model...');

  try {
    const detector = await createHandDetector();
    console.log('Hand pose detection model loaded successfully');
    return detector;
  } catch (error) {
    console.error('Error initializing hand tracking:', error);
    return null;
  }
};

// Helper to draw landmarks and connections
export const drawHandLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z?: number; name?: string }[],
  options: { color?: string; radius?: number; showLabels?: boolean } = {}
) => {
  // Validate landmarks before drawing
  if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) {
    console.warn('Invalid landmarks array passed to drawHandLandmarks');
    return;
  }

  // Check if all landmarks have valid coordinates
  const validLandmarks = landmarks.every(point =>
    typeof point.x === 'number' && !isNaN(point.x) &&
    typeof point.y === 'number' && !isNaN(point.y)
  );

  if (!validLandmarks) {
    console.warn('Invalid coordinates in landmarks array');
    return;
  }

  const color = options.color || 'lime';
  const radius = options.radius || 5;
  const showLabels = options.showLabels || false;

  // Draw points
  landmarks.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Optionally draw point labels
    if (showLabels) {
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.fillText(point.name || `${index}`, point.x + radius + 2, point.y);
    }
  });

  // Draw connections
  const connections = [
    [0,1],[1,2],[2,3],[3,4], // Thumb
    [0,5],[5,6],[6,7],[7,8], // Index
    [0,9],[9,10],[10,11],[11,12], // Middle
    [0,13],[13,14],[14,15],[15,16], // Ring
    [0,17],[17,18],[18,19],[19,20] // Pinky
  ];

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;

  for (const [start, end] of connections) {
    // Ensure both points exist
    if (landmarks[start] && landmarks[end]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x, landmarks[start].y);
      ctx.lineTo(landmarks[end].x, landmarks[end].y);
      ctx.stroke();
    }
  }
};

// Process a single hand detection result
const analyzeSingleHand = (
  hand: any,
  videoWidth?: number,
  videoHeight?: number
): SingleHandDetection => {
  const defaultSingleHand: SingleHandDetection = {
    isDetected: false,
    landmarks: null,
    confidence: 0,
    indexFingerPosition: null,
    handedness: 'Unknown',
    gesture: {
      isDrawing: false,
      isClearCanvas: false,
      isChangeColor: false,
      isEraser: false
    }
  };

  // Use MediaPipe landmarks only
  const landmarkNames = [
    'wrist',
    'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
    'index_finger_mcp', 'index_finger_pip', 'index_finger_dip', 'index_finger_tip',
    'middle_finger_mcp', 'middle_finger_pip', 'middle_finger_dip', 'middle_finger_tip',
    'ring_finger_mcp', 'ring_finger_pip', 'ring_finger_dip', 'ring_finger_tip',
    'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'
  ];

  // Log the raw hand data to understand its structure
  console.log('Raw hand data structure:', JSON.stringify(hand).substring(0, 500) + '...');

  // Check for different possible landmark structures
  let rawLandmarks = null;

  // First try keypoints3D as they might have better data
  if (hand.keypoints3D && Array.isArray(hand.keypoints3D) && hand.keypoints3D.length > 0) {
    rawLandmarks = hand.keypoints3D;
    console.log('Using hand.keypoints3D for landmarks');
  }
  // Then try regular keypoints
  else if (hand.keypoints && Array.isArray(hand.keypoints) && hand.keypoints.length > 0) {
    // Check if keypoints have valid coordinates
    const hasValidCoordinates = hand.keypoints.some((kp: any) =>
      (typeof kp.x === 'number' && !isNaN(kp.x)) ||
      (typeof kp.y === 'number' && !isNaN(kp.y))
    );

    if (hasValidCoordinates) {
      rawLandmarks = hand.keypoints;
      console.log('Using hand.keypoints for landmarks (valid coordinates)');
    } else {
      console.log('hand.keypoints exist but have no valid coordinates');
    }
  }
  // Finally try landmarks
  else if (hand.landmarks && Array.isArray(hand.landmarks) && hand.landmarks.length > 0) {
    rawLandmarks = hand.landmarks;
    console.log('Using hand.landmarks for landmarks');
  }

  // If we still don't have landmarks, try to find them in nested properties
  if (!rawLandmarks && typeof hand === 'object') {
    // Look for any property that might contain landmarks
    for (const key in hand) {
      const value = hand[key];
      if (Array.isArray(value) && value.length > 0 &&
          value[0] && typeof value[0] === 'object' &&
          (value[0].x !== undefined || value[0].x3D !== undefined)) {
        rawLandmarks = value;
        console.log(`Found landmarks in hand.${key}`);
        break;
      }
    }
  }

  if (!rawLandmarks || !Array.isArray(rawLandmarks)) {
    console.warn('No valid landmarks array found in hand data');
    console.log('Hand data keys:', Object.keys(hand));
    return {
      ...defaultSingleHand,
      isDetected: false,
      confidence: hand && typeof hand.score === 'number' ? hand.score : 0
    };
  }

  // Log the first landmark to understand its structure
  console.log('First landmark structure:', rawLandmarks[0]);

  // Ensure we have a reasonable number of landmarks (MediaPipe uses 21)
  if (rawLandmarks.length < 5) {
    console.warn(`Too few landmarks: ${rawLandmarks.length}`);
    return {
      ...defaultSingleHand,
      isDetected: false,
      confidence: hand && typeof hand.score === 'number' ? hand.score : 0
    };
  }

  // Scale normalized coordinates to video size
  const videoW = videoWidth || 640; // Default to 640 if no width provided
  const videoH = videoHeight || 480; // Default to 480 if no height provided

  // Process landmarks with better error handling for different formats
  const landmarks = rawLandmarks.map((kp: any, index: number) => {
    // Ensure x and y are valid numbers
    let x = null;
    let y = null;
    let z = null;

    // Log the keypoint structure to understand what we're working with
    if (index === 0) {
      console.log(`Keypoint structure for first point:`, kp);
    }

    // Handle different property names for coordinates
    // Standard format
    if (typeof kp.x === 'number' && !isNaN(kp.x)) {
      // Check if coordinates are normalized (between 0-1) or absolute
      x = kp.x > 1 ? kp.x : kp.x * videoW;
    }
    // Alternative format (x3D)
    else if (typeof kp.x3D === 'number' && !isNaN(kp.x3D)) {
      x = kp.x3D * videoW;
    }

    if (typeof kp.y === 'number' && !isNaN(kp.y)) {
      y = kp.y > 1 ? kp.y : kp.y * videoH;
    }
    else if (typeof kp.y3D === 'number' && !isNaN(kp.y3D)) {
      y = kp.y3D * videoH;
    }

    if (typeof kp.z === 'number' && !isNaN(kp.z)) {
      z = kp.z;
    }
    else if (typeof kp.z3D === 'number' && !isNaN(kp.z3D)) {
      z = kp.z3D;
    }

    // If we're using keypoints3D, they might be in a different format
    if (x === null && y === null && rawLandmarks === hand.keypoints3D) {
      // Try to extract coordinates from the keypoints3D format
      if (Array.isArray(kp) && kp.length >= 2) {
        // Format might be [x, y, z] array
        if (typeof kp[0] === 'number' && !isNaN(kp[0])) {
          x = kp[0] * videoW; // Assume normalized
        }
        if (typeof kp[1] === 'number' && !isNaN(kp[1])) {
          y = kp[1] * videoH; // Assume normalized
        }
        if (kp.length >= 3 && typeof kp[2] === 'number' && !isNaN(kp[2])) {
          z = kp[2];
        }
      }
    }

    // If we have an array format instead of object properties
    if (x === null && y === null && Array.isArray(kp) && kp.length >= 2) {
      if (typeof kp[0] === 'number' && !isNaN(kp[0])) {
        x = kp[0] > 1 ? kp[0] : kp[0] * videoW;
      }
      if (typeof kp[1] === 'number' && !isNaN(kp[1])) {
        y = kp[1] > 1 ? kp[1] : kp[1] * videoH;
      }
      if (kp.length >= 3 && typeof kp[2] === 'number' && !isNaN(kp[2])) {
        z = kp[2];
      }
    }

    // If we still don't have valid coordinates, try to find them in nested properties
    if (x === null && y === null && typeof kp === 'object') {
      for (const key in kp) {
        const value = kp[key];
        if (typeof value === 'object' && value !== null) {
          if (typeof value.x === 'number' && !isNaN(value.x)) {
            x = value.x > 1 ? value.x : value.x * videoW;
          }
          if (typeof value.y === 'number' && !isNaN(value.y)) {
            y = value.y > 1 ? value.y : value.y * videoH;
          }
          if (x !== null && y !== null) break;
        }
      }
    }

    // Use default values if coordinates are still null
    if (x === null) x = 0;
    if (y === null) y = 0;

    return {
      x,
      y,
      z,
      name: landmarkNames[index] || `point_${index}`
    };
  });

  const confidence = typeof hand.score === 'number' ? hand.score : 0.5;

  // Count valid keypoints (those with valid x and y coordinates)
  const validKeypoints = landmarks.filter(kp =>
    kp && kp.x !== null && kp.y !== null && !isNaN(kp.x) && !isNaN(kp.y)
  ).length;

  console.log(`Hand keypoints: ${validKeypoints}/${landmarks.length} valid points`);

  // If no valid keypoints, return early with default values
  if (validKeypoints === 0) {
    console.warn('No valid keypoints found in hand data');
    return {
      ...defaultSingleHand,
      isDetected: false,
      confidence
    };
  }

  // Determine handedness from the detection result
  let handedness: 'Left' | 'Right' | 'Unknown' = 'Unknown';

  if (hand.handedness) {
    if (typeof hand.handedness === 'string') {
      handedness = hand.handedness as 'Left' | 'Right';
    } else if (Array.isArray(hand.handedness) && hand.handedness.length > 0) {
      // Sometimes the API returns an array of classifications
      const classification = hand.handedness[0];
      if (classification && classification.label) {
        handedness = classification.label as 'Left' | 'Right';
      } else if (classification && typeof classification === 'string') {
        handedness = classification as 'Left' | 'Right';
      }
    }
  }

  // Get index finger tip position
  const indexFingerTip = landmarks.find((kp: any) => kp.name === 'index_finger_tip');
  let indexFingerPosition = null;

  if (indexFingerTip &&
      typeof indexFingerTip.x === 'number' && !isNaN(indexFingerTip.x) &&
      typeof indexFingerTip.y === 'number' && !isNaN(indexFingerTip.y)) {
    indexFingerPosition = {
      x: indexFingerTip.x,
      y: indexFingerTip.y
    };
  }

  // Helper function to check if a finger is extended
  const isFingerExtended = (fingerName: string): boolean => {
    // For now, just return a default value since we're still debugging the landmarks
    // This will prevent errors while we're fixing the landmark detection
    if (validKeypoints < 21) {
      console.log(`Not enough valid keypoints to determine if ${fingerName} is extended`);
      return false;
    }

    // Find the landmarks for this finger
    const tip = landmarks.find((kp: any) => kp.name === `${fingerName}_tip`);
    const pip = landmarks.find((kp: any) => kp.name === `${fingerName}_pip`); // Second joint
    const mcp = landmarks.find((kp: any) => kp.name === `${fingerName}_mcp`); // Base joint

    if (!tip || !pip || !mcp) {
      console.warn(`Missing landmarks for ${fingerName} finger`);
      return false;
    }

    // Validate coordinates
    const isValidCoordinate = (coord: any) =>
      coord !== null && typeof coord === 'number' && !isNaN(coord);

    // Check if all coordinates are valid
    const allValid =
      isValidCoordinate(tip.x) && isValidCoordinate(tip.y) &&
      isValidCoordinate(pip.x) && isValidCoordinate(pip.y) &&
      isValidCoordinate(mcp.x) && isValidCoordinate(mcp.y);

    if (!allValid) {
      // Just log once instead of multiple warnings
      console.log(`Invalid coordinates for ${fingerName} finger`);
      return false;
    }

    // Special case for thumb which has different geometry
    if (fingerName === 'thumb') {
      const wrist = landmarks.find((kp: any) => kp.name === 'wrist');
      if (!wrist || !isValidCoordinate(wrist.x) || !isValidCoordinate(wrist.y)) {
        return false;
      }

      // Calculate distance from thumb tip to wrist
      const distance = Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) +
        Math.pow(tip.y - wrist.y, 2)
      );

      // Thumb is extended if it's far enough from the wrist
      const extended = distance > 50; // Adjust threshold as needed
      return extended;
    }

    // For other fingers:
    // Calculate vectors for the finger segments
    const pipToTip = {
      x: tip.x - pip.x,
      y: tip.y - pip.y
    };
    const mcpToPip = {
      x: pip.x - mcp.x,
      y: pip.y - mcp.y
    };

    // Calculate the magnitudes
    const magnitude1 = Math.sqrt(pipToTip.x * pipToTip.x + pipToTip.y * pipToTip.y);
    const magnitude2 = Math.sqrt(mcpToPip.x * mcpToPip.x + mcpToPip.y * mcpToPip.y);

    if (magnitude1 < 5 || magnitude2 < 5) {
      console.log(`Very small magnitude for ${fingerName} finger, likely not valid`);
      return false;
    }

    // Calculate the angle between the segments
    const dotProduct = pipToTip.x * mcpToPip.x + pipToTip.y * mcpToPip.y;
    const cosAngle = dotProduct / (magnitude1 * magnitude2);

    // Handle potential numerical errors
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
    const angle = Math.acos(clampedCosAngle) * (180 / Math.PI);

    // Finger is considered extended if the angle is less than 120 degrees
    const isExtended = angle < 120;
    return isExtended;
  };

  // Check finger positions with error handling
  const thumbExtended = isFingerExtended('thumb');
  const indexFingerExtended = isFingerExtended('index_finger');
  const middleFingerExtended = isFingerExtended('middle_finger');
  const ringFingerExtended = isFingerExtended('ring_finger');
  const pinkyExtended = isFingerExtended('pinky');

  // Log the values for debugging
  console.log('[Gesture Debug] thumbExtended:', thumbExtended, 'indexFingerExtended:', indexFingerExtended, 'middleFingerExtended:', middleFingerExtended, 'ringFingerExtended:', ringFingerExtended, 'pinkyExtended:', pinkyExtended);

  // Log the actual landmark coordinates for index finger
  const logLandmark = (name: string) => {
    const lm = landmarks.find(l => l.name === name);
    if (lm) {
      console.log(`[Landmark Debug] ${name}: x=${lm.x}, y=${lm.y}, z=${lm.z}`);
    } else {
      console.log(`[Landmark Debug] ${name}: not found`);
    }
  };
  logLandmark('index_finger_tip');
  logLandmark('index_finger_pip');
  logLandmark('index_finger_mcp');

  // Calculate distances for specific gestures
  const indexTip = landmarks.find((kp: any) => kp.name === 'index_finger_tip');
  const middleTip = landmarks.find((kp: any) => kp.name === 'middle_finger_tip');

  // Check if index and middle finger are extended and close to each other (for eraser)
  let fingersClose = false;
  if (indexTip && middleTip &&
      indexTip.x !== null && indexTip.y !== null &&
      middleTip.x !== null && middleTip.y !== null &&
      indexFingerExtended && middleFingerExtended) {
    const distance = Math.sqrt(
      Math.pow(indexTip.x - middleTip.x, 2) +
      Math.pow(indexTip.y - middleTip.y, 2)
    );
    fingersClose = distance < 30;
  }

  // Determine gestures based on finger positions
  const gesture = {
    isDrawing: indexFingerExtended && !middleFingerExtended && !thumbExtended,
    isClearCanvas: thumbExtended && indexFingerExtended && middleFingerExtended,
    isChangeColor: thumbExtended && !indexFingerExtended && !middleFingerExtended,
    isEraser: indexFingerExtended && middleFingerExtended && fingersClose
  };

  // Log gesture detection for debugging
  console.log('[Gesture Debug] Gesture detection:', {
    indexFingerExtended,
    middleFingerExtended,
    thumbExtended,
    fingersClose,
    gesture
  });

  // Create a clean landmarks array with no null values
  const cleanLandmarks = landmarks.map(lm => ({
    x: lm.x === null ? 0 : lm.x,
    y: lm.y === null ? 0 : lm.y,
    z: lm.z === null ? 0 : lm.z,
    name: lm.name
  }));

  // Verify that all landmarks have valid coordinates
  const allLandmarksValid = cleanLandmarks.every(lm =>
    typeof lm.x === 'number' && !isNaN(lm.x) &&
    typeof lm.y === 'number' && !isNaN(lm.y)
  );

  // Log the returned object for debugging
  const result = {
    isDetected: true,
    landmarks: allLandmarksValid ? cleanLandmarks : null,
    confidence: confidence,
    indexFingerPosition,
    handedness,
    gesture: gesture
  } as SingleHandDetection;

  console.log('[analyzeSingleHand] returning:', {
    isDetected: result.isDetected,
    hasValidLandmarks: result.landmarks !== null,
    landmarksCount: result.landmarks ? result.landmarks.length : 0,
    confidence: result.confidence,
    handedness: result.handedness,
    gesture: result.gesture
  });

  return result;
};

// Detect hands and gestures in a video frame
export const detectHand = async (
  detector: handPoseDetection.HandDetector | null,
  video: HTMLVideoElement | null
): Promise<HandDetection> => {
  const defaultDetection: HandDetection = {
    isHandDetected: false,
    hands: [],
    landmarks: null,
    handInViewConfidence: 0,
    indexFingerPosition: null,
    gesture: {
      isDrawing: false,
      isClearCanvas: false,
      isChangeColor: false,
      isEraser: false
    }
  };

  if (!detector || !video) {
    console.warn('Detector or video element not available');
    return defaultDetection;
  }

  try {
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      console.warn('Video dimensions are zero');
      return defaultDetection;
    }

    // Run hand detection with better error handling
    let hands;
    try {
      console.log('Running hand detection...');
      hands = await detector.estimateHands(video, {
        flipHorizontal: false,
        staticImageMode: false
      });

      console.log('Hand detection result:', JSON.stringify(hands).substring(0, 200) + '...');
      console.log('Number of hands detected:', hands ? hands.length : 0);

      if (!hands || hands.length === 0) {
        return defaultDetection;
      }

      // Log the structure of the first hand to understand the data format
      if (hands.length > 0) {
        console.log('First hand keys:', Object.keys(hands[0]));

        // Check if we have keypoints
        if (hands[0].keypoints) {
          console.log('Keypoints available, count:', hands[0].keypoints.length);
        }

        // Check if we have landmarks (using any to bypass type checking)
        const firstHand = hands[0] as any;
        if (firstHand.landmarks) {
          console.log('Landmarks available, count:', firstHand.landmarks.length);
        }
      }
    } catch (detectionError) {
      console.error('Error in estimateHands:', detectionError);
      return defaultDetection;
    }

    // If we reach here, detection was successful but double-check
    if (!hands || hands.length === 0) {
      return defaultDetection;
    }

    // Process each detected hand
    const processedHands = hands.map(hand => analyzeSingleHand(hand, videoWidth, videoHeight));

    // Filter out hands with invalid landmarks
    const validHands = processedHands.filter(hand =>
      hand.landmarks &&
      Array.isArray(hand.landmarks) &&
      hand.landmarks.length === 21
    );

    if (validHands.length === 0) {
      console.warn('No hands with valid landmarks detected');
      return defaultDetection;
    }

    // Find the primary hand (right hand if available, otherwise left)
    const primaryHand = validHands.find(h => h.handedness === 'Right') ||
                       validHands.find(h => h.handedness === 'Left') ||
                       validHands[0];

    if (!primaryHand) {
      return defaultDetection;
    }

    // Calculate hand in view confidence
    const handInViewConfidence = Math.max(0, ...validHands.map(h => typeof h.confidence === 'number' ? h.confidence : 0));

    // Extract all landmarks for the HandDetection object
    const allLandmarks = validHands
      .map(h => h.landmarks)
      .filter(landmarks => landmarks !== null) as { x: number; y: number; z: number; name: string }[][];

    // Log detection results for debugging
    console.log('Hand detection results:', {
      handsDetected: hands.length,
      validHandsWithLandmarks: validHands.length,
      primaryHand: {
        handedness: primaryHand.handedness,
        confidence: primaryHand.confidence,
        indexFingerPosition: primaryHand.indexFingerPosition,
        hasValidLandmarks: primaryHand.landmarks && primaryHand.landmarks.length === 21,
        gesture: primaryHand.gesture
      }
    });

    return {
      isHandDetected: true,
      hands: validHands,
      landmarks: allLandmarks.length > 0 ? allLandmarks : null,
      handInViewConfidence,
      indexFingerPosition: primaryHand.indexFingerPosition,
      gesture: primaryHand.gesture
    };
  } catch (error) {
    console.error('Error in hand detection:', error);
    return defaultDetection;
  }
};

