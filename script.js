import {
    pipeline,
    env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm";


/* =========================================================
   CIVICCONNECT AI

   Features:
   1. Browser-based AI image classification
   2. Automatic GPS location
   3. GPS timeout = 10 seconds
   4. Manual location entry
   5. Complaint ID generation
   6. Complaint tracking
   7. Complaint timeline
   8. localStorage persistence
========================================================= */


env.useBrowserCache = true;

env.allowLocalModels = false;


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const uploadBox =
    $("uploadBox");

const chooseImageButton =
    $("chooseImageButton");

const imageInput =
    $("imageInput");

const previewContainer =
    $("previewContainer");

const preview =
    $("preview");

const removeImageButton =
    $("removeImageButton");

const analyzeButton =
    $("analyzeButton");

const statusBox =
    $("statusBox");

const loadingTitle =
    $("loadingTitle");

const loadingText =
    $("loadingText");

const aiProgressBar =
    $("aiProgressBar");

const progressText =
    $("progressText");

const errorBox =
    $("errorBox");

const errorText =
    $("errorText");

const retryButton =
    $("retryButton");

const resultSection =
    $("resultSection");

const successSection =
    $("successSection");

const issueResult =
    $("issueResult");

const categoryResult =
    $("categoryResult");

const departmentResult =
    $("departmentResult");

const confidenceResult =
    $("confidenceResult");

const severityResult =
    $("severityResult");

const severityBadge =
    $("severityBadge");

const descriptionResult =
    $("descriptionResult");

const predictionList =
    $("predictionList");

const locationResult =
    $("locationResult");

const locationCoordinates =
    $("locationCoordinates");

const getGpsButton =
    $("getGpsButton");

const manualLocationButton =
    $("manualLocationButton");

const gpsProgress =
    $("gpsProgress");

const manualLocationForm =
    $("manualLocationForm");

const manualAddress =
    $("manualAddress");

const manualLat =
    $("manualLat");

const manualLng =
    $("manualLng");

const saveManualLocationButton =
    $("saveManualLocationButton");

const confirmButton =
    $("confirmButton");

const complaintId =
    $("complaintId");

const copyComplaintButton =
    $("copyComplaintButton");

const newReportButton =
    $("newReportButton");

const trackInput =
    $("trackInput");

const trackButton =
    $("trackButton");

const trackEmpty =
    $("trackEmpty");

const trackResult =
    $("trackResult");

const trackedComplaintId =
    $("trackedComplaintId");

const trackedStatus =
    $("trackedStatus");

const trackedIssue =
    $("trackedIssue");

const trackedDepartment =
    $("trackedDepartment");

const trackedLocation =
    $("trackedLocation");

const trackedDate =
    $("trackedDate");

const complaintTimeline =
    $("complaintTimeline");

const mobileMenuButton =
    $("mobileMenuButton");

const mainNav =
    $("mainNav");

const backToTop =
    $("backToTop");

const metadataBox =
    $("metadataBox");

const metadataBadge =
    $("metadataBadge");

const metadataVerdict =
    $("metadataVerdict");

const metadataDetails =
    $("metadataDetails");

const recheckMetadataButton =
    $("recheckMetadataButton");

const duplicateAlert =
    $("duplicateAlert");

const trackedDuplicateInfo =
    $("trackedDuplicateInfo");

const trackedStatusHistory =
    $("trackedStatusHistory");

const authorityLoginView =
    $("authorityLoginView");

const authorityLoginForm =
    $("authorityLoginForm");

const authorityUsername =
    $("authorityUsername");

const authorityPassword =
    $("authorityPassword");

const authorityLoginError =
    $("authorityLoginError");

const authorityLogoutButton =
    $("authorityLogoutButton");

const authorityDashboard =
    $("authorityDashboard");

const authorityStats =
    $("authorityStats");

const authoritySearch =
    $("authoritySearch");

const authorityStatusFilter =
    $("authorityStatusFilter");

const authorityResultsCount =
    $("authorityResultsCount");

const authorityComplaintList =
    $("authorityComplaintList");

const authorityEmpty =
    $("authorityEmpty");


/* =========================================================
   VARIABLES
========================================================= */

let selectedFile = null;

let imageURL = null;

let classifier = null;

let isAnalyzing = false;

let currentAIResult = null;

let currentLocation = null;

let latestComplaintId = null;

let currentMetadataAnalysis = null;

let currentFileHash = null;

let metadataInspectionToken = 0;

let metadataInspectionPromise = null;


/* =========================================================
   LOCAL STORAGE KEY
========================================================= */

const STORAGE_KEY =
    "civicconnect_complaints_v2";

const AUTH_SESSION_KEY =
    "civicconnect_authority_session_v1";

const AUTH_CREDENTIALS = {
    username: "authority",
    password: "civic@123"
};

const AUTHORITY_STATUSES = [
    "Submitted",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Rejected"
];

const STATUS_STAGE = {
    "Submitted": 0,
    "Under Review": 1,
    "Assigned": 2,
    "In Progress": 3,
    "Resolved": 4,
    "Rejected": 1
};

const AI_METADATA_GENERATORS = [
    {
        name: "Stable Diffusion",
        patterns: [
            "stable diffusion",
            "stable-diffusion",
            "stablediffusion"
        ]
    },
    {
        name: "Midjourney",
        patterns: [
            "midjourney"
        ]
    },
    {
        name: "DALL-E",
        patterns: [
            "dall-e",
            "dall·e",
            "dalle"
        ]
    },
    {
        name: "Adobe Firefly",
        patterns: [
            "adobe firefly",
            "firefly"
        ]
    },
    {
        name: "ComfyUI",
        patterns: [
            "comfyui"
        ]
    },
    {
        name: "Automatic1111",
        patterns: [
            "automatic1111",
            "automatic1111"
        ]
    },
    {
        name: "InvokeAI",
        patterns: [
            "invokeai"
        ]
    },
    {
        name: "Leonardo AI",
        patterns: [
            "leonardo.ai",
            "leonardo ai"
        ]
    },
    {
        name: "Ideogram",
        patterns: [
            "ideogram"
        ]
    },
    {
        name: "C2PA AI provenance",
        patterns: [
            "trainedalgorithmicmedia",
            "trained algorithmic media"
        ]
    }
];

const AI_METADATA_MARKERS = [
    "negative prompt",
    "cfg scale",
    "steps:",
    "sampler:",
    "model hash",
    "clip skip",
    "seed:",
    "workflow",
    "generation data",
    "ai generated",
    "ai-generated",
    "generative fill",
    "generative expand"
];


/* =========================================================
   AI LABELS
========================================================= */

const labels = [

    "a photograph of a pothole or damaged road",

    "a photograph of garbage or waste dumped on a street",

    "a photograph of a broken streetlight",

    "a photograph of water leakage or a broken water pipe",

    "a photograph of an open manhole or damaged drain",

    "a photograph of a fallen tree blocking a road",

    "a photograph of damaged public infrastructure",

    "a photograph of a normal road with no obvious civic problem"

];


/* =========================================================
   ISSUE INFORMATION
========================================================= */

const issueInformation = {

    "a photograph of a pothole or damaged road": {

        issue:
            "Pothole / Damaged Road",

        category:
            "Road Infrastructure",

        department:
            "Roads Department",

        severity:
            "High",

        description:
            "The image appears to show a pothole or damaged section of road that may require repair."

    },


    "a photograph of garbage or waste dumped on a street": {

        issue:
            "Garbage Accumulation",

        category:
            "Waste Management",

        department:
            "Municipal Sanitation",

        severity:
            "Medium",

        description:
            "The image appears to show garbage or waste accumulated in a public area."

    },


    "a photograph of a broken streetlight": {

        issue:
            "Broken Streetlight",

        category:
            "Public Lighting",

        department:
            "Electrical Department",

        severity:
            "Medium",

        description:
            "The image appears to show a damaged or non-functioning streetlight."

    },


    "a photograph of water leakage or a broken water pipe": {

        issue:
            "Water Leakage",

        category:
            "Water Supply",

        department:
            "Water Works Department",

        severity:
            "High",

        description:
            "The image appears to show water leakage or damage involving a water pipe."

    },


    "a photograph of an open manhole or damaged drain": {

        issue:
            "Open Manhole / Damaged Drain",

        category:
            "Drainage",

        department:
            "Drainage Department",

        severity:
            "High",

        description:
            "The image appears to show an open manhole or damaged drainage infrastructure."

    },


    "a photograph of a fallen tree blocking a road": {

        issue:
            "Fallen Tree / Road Obstruction",

        category:
            "Public Safety",

        department:
            "Municipal Department",

        severity:
            "High",

        description:
            "The image appears to show a fallen tree or obstruction affecting a public road."

    },


    "a photograph of damaged public infrastructure": {

        issue:
            "Damaged Infrastructure",

        category:
            "Public Infrastructure",

        department:
            "Municipal Department",

        severity:
            "Medium",

        description:
            "The image appears to show damaged public infrastructure."

    },


    "a photograph of a normal road with no obvious civic problem": {

        issue:
            "No Clear Civic Issue",

        category:
            "Other",

        department:
            "Manual Review",

        severity:
            "Low",

        description:
            "The AI could not identify a clear civic problem from the photograph."

    }

};


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function updateProgress(
    title,
    message,
    percentage,
    progressMessage
) {

    loadingTitle.textContent =
        title;

    loadingText.textContent =
        message;

    aiProgressBar.style.width =
        `${Math.max(0, Math.min(100, percentage))}%`;

    progressText.textContent =
        progressMessage;

}


function showError(message) {

    statusBox.classList.add("hidden");

    resultSection.classList.add("hidden");

    errorBox.classList.remove("hidden");

    errorText.textContent =
        message;

    errorBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================================================
   COMPLAINT STORAGE
========================================================= */

function getComplaints() {

    try {

        const parsed =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {

            return {};

        }


        Object.values(parsed).forEach(
            normalizeComplaintRecord
        );


        return parsed;

    } catch {

        return {};

    }

}


function normalizeComplaintRecord(
    complaint
) {

    if (
        !complaint ||
        typeof complaint !== "object"
    ) {

        return complaint;

    }


    complaint.status =
        AUTHORITY_STATUSES.includes(
            complaint.status
        )
            ? complaint.status
            : "Submitted";


    if (
        !Array.isArray(
            complaint.timeline
        )
        ||
        complaint.timeline.length === 0
    ) {

        complaint.timeline =
            createDefaultTimeline(
                complaint.createdAt ||
                Date.now(),
                complaint.department ||
                "the responsible department"
            );

    }


    if (
        !Array.isArray(
            complaint.statusHistory
        )
    ) {

        complaint.statusHistory = [
            {
                status:
                    complaint.status,

                time:
                    complaint.createdAt ||
                    Date.now(),

                actor:
                    "System"
            }
        ];

    }


    if (
        !Array.isArray(
            complaint.duplicateMatches
        )
    ) {

        complaint.duplicateMatches = [];

    }


    complaint.hasPotentialDuplicate =
        Boolean(
            complaint.hasPotentialDuplicate ||
            complaint.duplicateMatches.length
        );


    return complaint;

}


function createDefaultTimeline(
    createdAt,
    department
) {

    return [

        {
            title:
                "Complaint submitted",

            description:
                "Your report has been successfully created.",

            time:
                createdAt,

            done:
                true

        },

        {
            title:
                "Department review",

            description:
                `The report is ready for review by ${department}.`,

            time:
                null,

            done:
                false

        },

        {
            title:
                "Action in progress",

            description:
                "Updates will appear here when the report progresses.",

            time:
                null,

            done:
                false

        },

        {
            title:
                "Resolved",

            description:
                "The civic issue has been marked as resolved.",

            time:
                null,

            done:
                false

        }

    ];

}


function saveComplaints(complaints) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(complaints)
    );

}


function generateComplaintId() {

    const complaints =
        getComplaints();

    let id;

    do {

        id =
            `CC-${Math.floor(
                100000 +
                Math.random() * 900000
            )}`;

    } while (complaints[id]);

    return id;

}


function formatDate(timestamp) {

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(
        new Date(timestamp)
    );

}


function normalizeLocationForDisplay(location) {

    if (!location) {

        return "Not provided";

    }


    if (location.method === "gps") {

        return `GPS (${Number(location.latitude).toFixed(5)}, ${Number(location.longitude).toFixed(5)})`;

    }


    return location.address ||
        "Manual location";

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

mobileMenuButton?.addEventListener(
    "click",
    () => {

        const open =
            mainNav.classList.toggle("open");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(open)
        );

    }
);


mainNav
    ?.querySelectorAll("a")
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    mainNav.classList.remove(
                        "open"
                    );

                    mobileMenuButton?.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );


/* =========================================================
   IMAGE UPLOAD
========================================================= */

uploadBox?.addEventListener(
    "click",
    () => imageInput.click()
);


chooseImageButton?.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        imageInput.click();

    }
);


imageInput?.addEventListener(
    "change",
    handleImageUpload
);


uploadBox?.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        uploadBox.classList.add(
            "dragging"
        );

    }
);


uploadBox?.addEventListener(
    "dragleave",
    () => {

        uploadBox.classList.remove(
            "dragging"
        );

    }
);


uploadBox?.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        uploadBox.classList.remove(
            "dragging"
        );

        const file =
            event.dataTransfer.files?.[0];

        if (file) {

            processSelectedFile(file);

        }

    }
);


function handleImageUpload(event) {

    const file =
        event.target.files?.[0];

    if (file) {

        processSelectedFile(file);

    }

}


function processSelectedFile(file) {

    const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];


    if (!allowedTypes.includes(file.type)) {

        showError(
            "Please upload a JPG, PNG or WEBP image."
        );

        return;

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        showError(
            "The image is larger than 10 MB. Please choose a smaller image."
        );

        return;

    }


    selectedFile =
        file;


    if (imageURL) {

        URL.revokeObjectURL(
            imageURL
        );

    }


    imageURL =
        URL.createObjectURL(file);


    preview.src =
        imageURL;


    uploadBox.classList.add(
        "hidden"
    );


    previewContainer.classList.remove(
        "hidden"
    );


    statusBox.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    resultSection.classList.add(
        "hidden"
    );


    successSection.classList.add(
        "hidden"
    );


    currentAIResult =
        null;


    currentLocation =
        null;

    currentMetadataAnalysis =
        null;

    currentFileHash =
        null;

    metadataInspectionToken += 1;

    metadataInspectionPromise =
        null;

    resetMetadataUI();

    currentMetadataAnalysis =
        null;

    currentFileHash =
        null;

    metadataInspectionPromise =
        null;

    resetMetadataUI();

    metadataInspectionPromise =
        inspectImageMetadata(
            file
        );


    updateStepIndicator(1);

}


/* =========================================================
   RESET IMAGE
========================================================= */

removeImageButton?.addEventListener(
    "click",
    resetImage
);


function resetImage() {

    selectedFile =
        null;

    currentAIResult =
        null;

    currentLocation =
        null;


    if (imageURL) {

        URL.revokeObjectURL(
            imageURL
        );

        imageURL =
            null;

    }


    preview.src =
        "";

    imageInput.value =
        "";


    uploadBox.classList.remove(
        "hidden"
    );


    previewContainer.classList.add(
        "hidden"
    );


    statusBox.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    resultSection.classList.add(
        "hidden"
    );


    successSection.classList.add(
        "hidden"
    );


    manualLocationForm.classList.add(
        "hidden"
    );


    gpsProgress.classList.add(
        "hidden"
    );


    updateStepIndicator(1);

}


/* =========================================================
   AI EVENTS
========================================================= */

analyzeButton?.addEventListener(
    "click",
    analyzeImage
);


retryButton?.addEventListener(
    "click",
    analyzeImage
);


/* =========================================================
   LOAD AI
========================================================= */

async function loadAI() {

    if (classifier) {

        updateProgress(
            "AI model ready",
            "The model is already loaded in your browser.",
            100,
            "Ready"
        );

        return classifier;

    }


    updateProgress(
        "Loading AI model",
        "The model is being downloaded to your browser. The first run can take a few minutes.",
        5,
        "Connecting to Hugging Face..."
    );


    try {

        classifier =
            await pipeline(

                "zero-shot-image-classification",

                "Xenova/clip-vit-base-patch32",

                {

                    dtype: "q8",

                    progress_callback:
                        (progress) => {

                            if (!progress) {

                                return;

                            }


                            if (
                                progress.status ===
                                "progress" &&
                                typeof progress.progress ===
                                "number"
                            ) {

                                const percentage =
                                    Math.min(
                                        95,
                                        Math.max(
                                            5,
                                            progress.progress
                                        )
                                    );


                                updateProgress(
                                    "Downloading AI model",
                                    "Please keep this page open while the AI model downloads.",
                                    percentage,
                                    `${Math.round(percentage)}% downloaded`
                                );

                            }


                            if (
                                progress.status ===
                                "initiate"
                            ) {

                                updateProgress(
                                    "Starting AI download",
                                    "Preparing model files...",
                                    5,
                                    "Starting..."
                                );

                            }


                            if (
                                progress.status ===
                                "done"
                            ) {

                                updateProgress(
                                    "Preparing AI",
                                    "Model downloaded. Preparing it for analysis...",
                                    95,
                                    "Almost ready..."
                                );

                            }

                        }

                }

            );


        updateProgress(
            "AI model ready",
            "The model is now loaded in your browser.",
            100,
            "Ready"
        );


        return classifier;

    } catch (error) {

        classifier =
            null;

        console.error(
            "AI MODEL ERROR:",
            error
        );

        throw new Error(
            "The AI model could not be downloaded. Check your internet connection and try again."
        );

    }

}


/* =========================================================
   ANALYZE IMAGE
========================================================= */

async function analyzeImage() {

    if (isAnalyzing) {

        return;

    }


    if (
        !selectedFile ||
        !imageURL
    ) {

        showError(
            "Please upload an image first."
        );

        return;

    }


    isAnalyzing =
        true;


    analyzeButton.disabled =
        true;


    errorBox.classList.add(
        "hidden"
    );


    resultSection.classList.add(
        "hidden"
    );


    successSection.classList.add(
        "hidden"
    );


    statusBox.classList.remove(
        "hidden"
    );


    updateStepIndicator(2);


    try {

        updateProgress(
            "Preparing image",
            "Preparing your photograph for AI analysis.",
            2,
            "Preparing image..."
        );


        await waitForImage();


        const ai =
            await loadAI();


        updateProgress(
            "Analyzing image",
            "Comparing your image with civic issue categories.",
            97,
            "AI analysis in progress..."
        );


        const predictions =
            await ai(
                imageURL,
                labels
            );


        if (
            !predictions?.length
        ) {

            throw new Error(
                "The AI returned no predictions."
            );

        }


        predictions.sort(
            (a, b) =>
                b.score - a.score
        );


        const bestPrediction =
            predictions[0];


        displayResult(
            bestPrediction,
            predictions
        );


        currentAIResult = {

            ...issueInformation[
                bestPrediction.label
            ],

            confidence:
                Math.round(
                    bestPrediction.score *
                    100
                ),

            predictions:
                predictions
                    .slice(0, 5)
                    .map(
                        (p) => ({

                            label:
                                p.label,

                            score:
                                Math.round(
                                    p.score *
                                    100
                                )

                        })
                    )

        };


        updateStepIndicator(3);


        getLocation();

    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        showError(
            error.message ||
            "AI analysis failed. Please try again."
        );


        updateStepIndicator(2);

    } finally {

        isAnalyzing =
            false;

        analyzeButton.disabled =
            false;

    }

}


/* =========================================================
   WAIT FOR IMAGE
========================================================= */

function waitForImage() {

    return new Promise(
        (resolve, reject) => {

            if (preview.complete) {

                resolve();

                return;

            }


            preview.onload =
                () => resolve();


            preview.onerror =
                () =>
                    reject(
                        new Error(
                            "The selected image could not be loaded."
                        )
                    );

        }
    );

}


/* =========================================================
   DISPLAY RESULT
========================================================= */

function displayResult(
    bestPrediction,
    predictions
) {

    const info =
        issueInformation[
            bestPrediction.label
        ];


    if (!info) {

        throw new Error(
            "The AI returned an unknown category."
        );

    }


    issueResult.textContent =
        info.issue;


    categoryResult.textContent =
        info.category;


    departmentResult.textContent =
        info.department;


    confidenceResult.textContent =
        `${Math.round(
            bestPrediction.score *
            100
        )}%`;


    severityResult.textContent =
        info.severity;


    severityBadge.textContent =
        info.severity;


    severityBadge.className =
        `severity-badge severity-${info.severity.toLowerCase()}`;


    descriptionResult.textContent =
        info.description;


    displayPredictions(
        predictions
    );


    statusBox.classList.add(
        "hidden"
    );


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   PREDICTIONS
========================================================= */

function displayPredictions(
    predictions
) {

    predictionList.innerHTML =
        "";


    predictions
        .slice(0, 5)
        .forEach(
            (prediction) => {

                const percentage =
                    Math.round(
                        prediction.score *
                        100
                    );


                const info =
                    issueInformation[
                        prediction.label
                    ];


                const name =
                    info
                        ? info.issue
                        : prediction.label;


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "prediction";


                div.innerHTML = `

                    <div class="prediction-info">

                        <span>
                            ${escapeHTML(name)}
                        </span>

                        <strong>
                            ${percentage}%
                        </strong>

                    </div>

                    <div class="prediction-bar-background">

                        <div
                            class="prediction-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                `;


                predictionList.appendChild(
                    div
                );

            }
        );

}


/* =========================================================
   LOCATION
========================================================= */

/*
    GPS timeout is exactly 10 seconds.
*/

getGpsButton?.addEventListener(
    "click",
    getLocation
);


manualLocationButton?.addEventListener(
    "click",
    () => {

        manualLocationForm.classList.toggle(
            "hidden"
        );


        if (
            !manualLocationForm.classList.contains(
                "hidden"
            )
        ) {

            manualAddress.focus();

        }

    }
);


saveManualLocationButton?.addEventListener(
    "click",
    saveManualLocation
);


function getLocation() {

    if (!navigator.geolocation) {

        setLocationUnavailable(
            "GPS is not supported by this browser. Please add the location manually."
        );


        manualLocationForm.classList.remove(
            "hidden"
        );


        return;

    }


    gpsProgress.classList.remove(
        "hidden"
    );


    getGpsButton.disabled =
        true;


    locationResult.textContent =
        "Requesting GPS location…";


    locationCoordinates.textContent =
        "Your browser has up to 10 seconds to return a location.";


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            currentLocation = {

                method:
                    "gps",

                latitude:
                    latitude,

                longitude:
                    longitude,

                accuracy:
                    position.coords.accuracy,

                address:
                    `GPS coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

            };


            gpsProgress.classList.add(
                "hidden"
            );


            getGpsButton.disabled =
                false;


            manualLocationForm.classList.add(
                "hidden"
            );


            locationResult.textContent =
                "Location captured";


            locationCoordinates.textContent =
                `Latitude: ${latitude.toFixed(6)} · Longitude: ${longitude.toFixed(6)} · Accuracy: approximately ${Math.round(position.coords.accuracy)} m`;

            refreshDuplicateDetection();


            updateStepIndicator(3);

        },


        (error) => {

            console.warn(
                "Location error:",
                error
            );


            const reason =
                error.code === 1

                    ? "Location permission was denied."

                    : error.code === 2

                        ? "Your location could not be determined."

                        : "The 10-second GPS timeout expired.";


            setLocationUnavailable(
                `${reason} You can add the location manually.`
            );


            manualLocationForm.classList.remove(
                "hidden"
            );


            getGpsButton.disabled =
                false;

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                10000,

            maximumAge:
                0

        }

    );

}


/* =========================================================
   LOCATION UNAVAILABLE
========================================================= */

function setLocationUnavailable(
    message
) {

    gpsProgress.classList.add(
        "hidden"
    );


    getGpsButton.disabled =
        false;


    locationResult.textContent =
        "Manual location available";


    locationCoordinates.textContent =
        message;

}


/* =========================================================
   SAVE MANUAL LOCATION
========================================================= */

function saveManualLocation() {

    const address =
        manualAddress.value.trim();


    if (!address) {

        manualAddress.focus();


        showError(
            "Please enter an address or nearby landmark for the manual location."
        );


        return;

    }


    const latText =
        manualLat.value.trim();


    const lngText =
        manualLng.value.trim();


    const hasLat =
        latText !== "";


    const hasLng =
        lngText !== "";


    if (hasLat !== hasLng) {

        showError(
            "If you enter coordinates manually, please enter both latitude and longitude."
        );


        return;

    }


    let latitude =
        null;


    let longitude =
        null;


    if (
        hasLat &&
        hasLng
    ) {

        latitude =
            Number(latText);


        longitude =
            Number(lngText);


        if (

            !Number.isFinite(
                latitude
            )

            ||

            latitude < -90

            ||

            latitude > 90

            ||

            !Number.isFinite(
                longitude
            )

            ||

            longitude < -180

            ||

            longitude > 180

        ) {

            showError(
                "Please enter valid latitude and longitude values."
            );


            return;

        }

    }


    currentLocation = {

        method:
            "manual",

        address:
            address,

        latitude:
            latitude,

        longitude:
            longitude

    };


    locationResult.textContent =
        "Manual location saved";


    locationCoordinates.textContent =
        latitude !== null

            ? `${address} · ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

            : address;


    manualLocationForm.classList.add(
        "hidden"
    );


    updateStepIndicator(4);


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CONFIRM REPORT
========================================================= */

confirmButton?.addEventListener(
    "click",
    createComplaint
);


async function createComplaint() {

    if (
        metadataInspectionPromise
    ) {

        try {

            await metadataInspectionPromise;

        } catch {

            /* Metadata is informational; submission can continue. */

        }

    }


    if (!currentAIResult) {

        showError(
            "Please complete the AI analysis before submitting."
        );

        return;

    }


    if (!currentLocation) {

        showError(
            "Please add a location using GPS or the manual location option before submitting."
        );


        manualLocationForm.classList.remove(
            "hidden"
        );


        return;

    }


    const createdAt =
        Date.now();

    const duplicateMatches =
        findPotentialDuplicateComplaints({
            issue:
                currentAIResult.issue,

            category:
                currentAIResult.category,

            location:
                currentLocation,

            fileHash:
                currentFileHash
        });

    const id =
        generateComplaintId();


    const complaint = {

        id:

            id,

        createdAt:

            createdAt,

        issue:

            currentAIResult.issue,

        category:

            currentAIResult.category,

        department:

            currentAIResult.department,

        severity:

            currentAIResult.severity,

        confidence:

            currentAIResult.confidence,

        description:

            currentAIResult.description,

        location:

            currentLocation,

        metadataAnalysis:

            currentMetadataAnalysis
                ? { ...currentMetadataAnalysis }
                : null,

        fileHash:

            currentFileHash,

        hasPotentialDuplicate:

            duplicateMatches.length > 0,

        duplicateMatches:

            duplicateMatches
                .slice(0, 5)
                .map(
                    (match) => ({
                        id:
                            match.id,

                        issue:
                            match.issue,

                        status:
                            match.status,

                        createdAt:
                            match.createdAt,

                        reason:
                            match.reason,

                        score:
                            match.score
                    })
                ),

        duplicateOf:

            duplicateMatches[0]?.id ||
            null,

        status:

            "Submitted",

        statusHistory: [

            {
                status:
                    "Submitted",

                time:
                    createdAt,

                actor:
                    "Citizen"
            }

        ],

        timeline: [

            {

                title:
                    "Complaint submitted",

                description:
                    "Your report has been successfully created.",

                time:
                    createdAt,

                done:
                    true

            },


            {

                title:
                    "Department review",

                description:
                    `The report is ready for review by ${currentAIResult.department}.`,

                time:
                    null,

                done:
                    false

            },


            {

                title:
                    "Action in progress",

                description:
                    "Updates will appear here when the report progresses.",

                time:
                    null,

                done:
                    false

            },


            {

                title:
                    "Resolved",

                description:
                    "The civic issue has been marked as resolved.",

                time:
                    null,

                done:
                    false

            }

        ]

    };


    const complaints =
        getComplaints();


    complaints[id] =
        complaint;


    saveComplaints(
        complaints
    );

    if (
        isAuthorityLoggedIn()
    ) {

        renderAuthorityDashboard();

    }


    latestComplaintId =
        id;


    complaintId.textContent =
        id;


    resultSection.classList.add(
        "hidden"
    );


    statusBox.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    successSection.classList.remove(
        "hidden"
    );


    updateStepIndicator(4);


    successSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   COPY COMPLAINT ID
========================================================= */

copyComplaintButton?.addEventListener(
    "click",
    async () => {

        const id =
            complaintId.textContent;


        try {

            await navigator.clipboard.writeText(
                id
            );


            copyComplaintButton.textContent =
                "Copied ✓";


            setTimeout(
                () =>
                    copyComplaintButton.textContent =
                        "Copy ID",
                1600
            );

        } catch {

            copyComplaintButton.textContent =
                "Copy unavailable";


            setTimeout(
                () =>
                    copyComplaintButton.textContent =
                        "Copy ID",
                1600
            );

        }

    }
);


/* =========================================================
   NEW REPORT
========================================================= */

newReportButton?.addEventListener(
    "click",
    () => {

        resetImage();

        window.location.hash =
            "report";

    }
);


/* =========================================================
   TRACK CREATED COMPLAINT
========================================================= */

$("trackCreatedButton")?.addEventListener(
    "click",
    () => {

        setTimeout(
            () => {

                if (latestComplaintId) {

                    trackInput.value =
                        latestComplaintId;

                    trackComplaint();

                }

            },
            100
        );

    }
);


/* =========================================================
   TRACK COMPLAINT
========================================================= */

trackButton?.addEventListener(
    "click",
    trackComplaint
);


trackInput?.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Enter"
        ) {

            trackComplaint();

        }

    }
);


function trackComplaint() {

    const id =
        trackInput.value
            .trim()
            .toUpperCase();


    if (!id) {

        trackInput.focus();

        return;

    }


    const complaints =
        getComplaints();


    const complaint =
        complaints[id];


    if (!complaint) {

        trackResult.classList.add(
            "hidden"
        );


        trackEmpty.classList.remove(
            "hidden"
        );


        trackEmpty.innerHTML = `

            <div class="empty-icon error-empty">
                !
            </div>

            <h3>
                Complaint not found
            </h3>

            <p>
                No complaint with ID
                <strong>
                    ${escapeHTML(id)}
                </strong>
                exists in this browser.
            </p>

        `;


        return;

    }


    renderTrackedComplaint(
        complaint
    );

}


/* =========================================================
   RENDER TRACKED COMPLAINT
========================================================= */

function renderTrackedComplaint(
    complaint
) {

    trackEmpty.classList.add(
        "hidden"
    );


    trackResult.classList.remove(
        "hidden"
    );


    trackedComplaintId.textContent =
        complaint.id;


    trackedStatus.textContent =
        complaint.status;


    trackedStatus.className =
        `status-pill status-${complaint.status.toLowerCase().replace(/\s+/g, "-")}`;


    trackedIssue.textContent =
        complaint.issue;


    trackedDepartment.textContent =
        complaint.department;


    trackedLocation.textContent =
        normalizeLocationForDisplay(
            complaint.location
        );


    trackedDate.textContent =
        formatDate(
            complaint.createdAt
        );


    complaint =
        normalizeComplaintRecord(
            complaint
        );


    complaintTimeline.innerHTML =
        "";


    complaint.timeline.forEach(
        (item, index) => {

            const node =
                document.createElement(
                    "div"
                );


            node.className =
                `timeline-item ${
                    item.done
                        ? "done"
                        : ""
                }`;


            node.innerHTML = `

                <div class="timeline-marker">
                    ${
                        item.done
                            ? "✓"
                            : index + 1
                    }
                </div>

                <div class="timeline-content">

                    <div class="timeline-title-row">

                        <h4>
                            ${escapeHTML(item.title)}
                        </h4>

                        ${
                            item.time

                                ? `
                                    <time>
                                        ${escapeHTML(
                                            formatDate(
                                                item.time
                                            )
                                        )}
                                    </time>
                                  `

                                : ""
                        }

                    </div>

                    <p>
                        ${escapeHTML(
                            item.description
                        )}
                    </p>

                </div>

            `;


            complaintTimeline.appendChild(
                node
            );

        }
    );


    renderTrackedDuplicateInfo(
        complaint
    );

    renderTrackedStatusHistory(
        complaint
    );

}


/* =========================================================
   STEP INDICATOR
========================================================= */

function updateStepIndicator(
    activeStep
) {

    document
        .querySelectorAll(
            ".step-item"
        )
        .forEach(
            (item, index) => {

                item.classList.toggle(
                    "active",
                    index + 1 <= activeStep
                );


                item.classList.toggle(
                    "complete",
                    index + 1 < activeStep
                );

            }
        );


    document
        .querySelectorAll(
            ".step-line"
        )
        .forEach(
            (line, index) => {

                line.classList.toggle(
                    "active",
                    index + 1 < activeStep
                );

            }
        );

}


/* =========================================================
   BACK TO TOP
========================================================= */

window.addEventListener(
    "scroll",
    () => {

        backToTop.classList.toggle(
            "show",
            window.scrollY > 600
        );

    }
);


backToTop?.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

console.log(
    "CivicConnect AI loaded successfully."
);


console.log(
    "Browser AI: Transformers.js"
);


console.log(
    "AI model: Xenova/clip-vit-base-patch32"
);


console.log(
    "Complaint storage: localStorage"
);


console.log(
    "GPS timeout: 10 seconds"
);

/* =========================================================
   METADATA / AI-ORIGIN INSPECTION
========================================================= */

/*
    This is a metadata-based provenance indicator, not a forensic
    AI-image detector. It intentionally avoids claiming that an image
    is human-made merely because AI metadata is absent.
*/

function resetMetadataUI() {

    metadataBox?.classList.add(
        "hidden"
    );

    if (metadataBadge) {

        metadataBadge.textContent =
            "Scanning…";

        metadataBadge.className =
            "metadata-badge";

    }

    if (metadataVerdict) {

        metadataVerdict.textContent =
            "Inspecting the image metadata…";

    }

    if (metadataDetails) {

        metadataDetails.innerHTML =
            "";

    }

}


recheckMetadataButton?.addEventListener(
    "click",
    () => {

        if (selectedFile) {

            inspectImageMetadata(
                selectedFile
            );

        }

    }
);


async function inspectImageMetadata(
    file
) {

    const token =
        ++metadataInspectionToken;


    metadataBox?.classList.remove(
        "hidden"
    );

    if (metadataBadge) {

        metadataBadge.textContent =
            "Scanning…";

        metadataBadge.className =
            "metadata-badge metadata-scanning";

    }

    if (metadataVerdict) {

        metadataVerdict.textContent =
            "Reading EXIF, XMP and file-provenance markers…";

    }


    try {

        const buffer =
            await file.arrayBuffer();


        if (
            token !==
            metadataInspectionToken
        ) {

            return;

        }


        currentFileHash =
            await sha256Hex(
                buffer
            );


        const analysis =
            analyzeImageMetadataBuffer(
                file,
                buffer
            );


        analysis.fileHash =
            currentFileHash;


        analysis.fileName =
            file.name;


        analysis.fileType =
            file.type ||
            "Unknown";


        analysis.fileSize =
            file.size;


        analysis.dimensions =
            `${preview.naturalWidth || "?"} × ${preview.naturalHeight || "?"}`;


        currentMetadataAnalysis =
            analysis;


        renderMetadataAnalysis(
            analysis
        );


        refreshDuplicateDetection();

    } catch (error) {

        console.warn(
            "Metadata inspection failed:",
            error
        );


        currentMetadataAnalysis = {

            verdict:
                "Metadata inspection unavailable",

            confidence:
                "Low",

            signals:
                [],

            metadataTypes:
                [],

            fileName:
                file.name,

            fileType:
                file.type ||
                "Unknown",

            fileSize:
                file.size,

            error:
                true

        };


        renderMetadataAnalysis(
            currentMetadataAnalysis
        );

    }

}


async function sha256Hex(
    buffer
) {

    if (
        !window.crypto?.subtle
    ) {

        return null;

    }


    const digest =
        await crypto.subtle.digest(
            "SHA-256",
            buffer
        );


    return Array
        .from(
            new Uint8Array(
                digest
            )
        )
        .map(
            (byte) =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


function analyzeImageMetadataBuffer(
    file,
    buffer
) {

    const bytes =
        new Uint8Array(
            buffer
        );


    const metadataTypes =
        detectMetadataBlocks(
            file,
            bytes
        );


    const sampleText =
        extractMetadataText(
            bytes
        )
            .toLowerCase();


    const generatorMatches = [];


    AI_METADATA_GENERATORS.forEach(
        (generator) => {

            const found =
                generator.patterns.some(
                    (pattern) =>
                        sampleText.includes(
                            pattern
                        )
                );


            if (found) {

                generatorMatches.push(
                    generator.name
                );

            }

        }
    );


    const markerMatches =
        AI_METADATA_MARKERS.filter(
            (marker) =>
                sampleText.includes(
                    marker
                )
        );


    const provenanceMatches = [];

    [
        "c2pa",
        "content credentials",
        "digital sourcetype",
        "trainedalgorithmicmedia"
    ].forEach(
        (marker) => {

            if (
                sampleText.includes(
                    marker
                )
            ) {

                provenanceMatches.push(
                    marker
                );

            }

        }
    );


    const cameraSignals =
        [
            "make",
            "model",
            "lensmodel",
            "datetimeoriginal",
            "exposuretime",
            "fnumber",
            "focallength"
        ]
            .filter(
                (marker) =>
                    sampleText.includes(
                        marker
                    )
            );


    let verdict =
        "No AI-generation metadata detected";

    let confidence =
        "Low";

    let badgeClass =
        "metadata-not-detected";


    if (
        generatorMatches.length
    ) {

        verdict =
            `AI-generation metadata detected: ${generatorMatches.join(", ")}`;

        confidence =
            "High";

        badgeClass =
            "metadata-ai";

    } else if (
        markerMatches.length >=
        2 ||
        provenanceMatches.length
    ) {

        verdict =
            "Possible AI-generation metadata detected; manual review is recommended.";

        confidence =
            "Medium";

        badgeClass =
            "metadata-possible";

    }


    return {

        verdict:
            verdict,

        confidence:
            confidence,

        badgeClass:
            badgeClass,

        generatorMatches:
            generatorMatches,

        markerMatches:
            markerMatches,

        provenanceMatches:
            provenanceMatches,

        cameraSignals:
            cameraSignals,

        metadataTypes:
            metadataTypes,

        signals:
            [
                ...generatorMatches,
                ...markerMatches,
                ...provenanceMatches
            ]

    };

}


function renderMetadataAnalysis(
    analysis
) {

    if (!metadataBox) {

        return;

    }


    metadataBox.classList.remove(
        "hidden"
    );


    metadataBadge.textContent =
        analysis.confidence === "High"
            ? "AI signal"
            : analysis.confidence === "Medium"
                ? "Review"
                : "No AI signal";


    metadataBadge.className =
        `metadata-badge ${
            analysis.badgeClass ||
            "metadata-not-detected"
        }`;


    metadataVerdict.textContent =
        analysis.verdict;


    const details = [

        [
            "File",
            analysis.fileName || "-"
        ],

        [
            "Type",
            analysis.fileType || "-"
        ],

        [
            "Size",
            formatBytes(
                analysis.fileSize || 0
            )
        ],

        [
            "Dimensions",
            analysis.dimensions || "-"
        ],

        [
            "Metadata blocks",
            analysis.metadataTypes?.length
                ? analysis.metadataTypes.join(", ")
                : "No standard provenance blocks detected"
        ],

        [
            "Generator markers",
            analysis.generatorMatches?.length
                ? analysis.generatorMatches.join(", ")
                : "None found"
        ]

    ];


    metadataDetails.innerHTML =
        details
            .map(
                ([label, value]) => `
                    <div class="metadata-detail">
                        <span>${escapeHTML(label)}</span>
                        <strong>${escapeHTML(String(value))}</strong>
                    </div>
                `
            )
            .join("");


}


function formatBytes(
    bytes
) {

    if (
        !Number.isFinite(bytes) ||
        bytes <= 0
    ) {

        return "Unknown";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.min(
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );


    return `${(
        bytes /
        (1024 ** index)
    ).toFixed(
        index === 0
            ? 0
            : 1
    )} ${units[index]}`;

}


function extractMetadataText(
    bytes
) {

    const maxFront =
        Math.min(
            bytes.length,
            2_500_000
        );

    const start =
        bytes.slice(
            0,
            maxFront
        );

    const endStart =
        Math.max(
            maxFront,
            bytes.length -
            750_000
        );

    const end =
        bytes.slice(
            endStart
        );


    const merged =
        new Uint8Array(
            start.length +
            end.length
        );


    merged.set(
        start,
        0
    );

    merged.set(
        end,
        start.length
    );


    let text = "";


    for (
        let i = 0;
        i < merged.length;
        i += 1
    ) {

        const byte =
            merged[i];


        text +=
            (
                byte === 9 ||
                byte === 10 ||
                byte === 13 ||
                (
                    byte >= 32 &&
                    byte <= 126
                )
            )
                ? String.fromCharCode(
                    byte
                )
                : " ";

    }


    return text;

}


function detectMetadataBlocks(
    file,
    bytes
) {

    const types =
        new Set();


    const type =
        (
            file.type ||
            ""
        ).toLowerCase();


    const text =
        extractMetadataText(
            bytes
        );


    if (
        type === "image/jpeg" ||
        (
            bytes[0] === 0xFF &&
            bytes[1] === 0xD8
        )
    ) {

        if (
            text.includes(
                "Exif"
            )
        ) {

            types.add(
                "EXIF"
            );

        }

        if (
            text.includes(
                "http://ns.adobe.com/xap/1.0/"
            ) ||
            text.includes(
                "XMP"
            )
        ) {

            types.add(
                "XMP"
            );

        }

        if (
            text.includes(
                "Photoshop"
            ) ||
            text.includes(
                "8BIM"
            )
        ) {

            types.add(
                "Photoshop/IPTC"
            );

        }

    }


    if (
        type === "image/png" ||
        (
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4E &&
            bytes[3] === 0x47
        )
    ) {

        const chunkText =
            [
                "tEXt",
                "zTXt",
                "iTXt",
                "eXIf"
            ]
                .filter(
                    (chunk) =>
                        text.includes(
                            chunk
                        )
                );


        if (
            chunkText.length
        ) {

            chunkText.forEach(
                (chunk) =>
                    types.add(
                        `PNG ${chunk}`
                    )
            );

        }

    }


    if (
        type === "image/webp" ||
        (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46
        )
    ) {

        [
            "EXIF",
            "XMP ",
            "ICCP",
            "IPTC"
        ]
            .forEach(
                (chunk) => {

                    if (
                        text.includes(
                            chunk
                        )
                    ) {

                        types.add(
                            `WebP ${chunk.trim()}`
                        );

                    }

                }
            );

    }


    return Array.from(
        types
    );

}


/* =========================================================
   DUPLICATE REPORT DETECTION
========================================================= */

function refreshDuplicateDetection() {

    if (
        !duplicateAlert
    ) {

        return;

    }


    if (
        !currentAIResult ||
        !currentLocation
    ) {

        duplicateAlert.classList.add(
            "hidden"
        );

        return;

    }


    const matches =
        findPotentialDuplicateComplaints({
            issue:
                currentAIResult.issue,

            category:
                currentAIResult.category,

            location:
                currentLocation,

            fileHash:
                currentFileHash
        });


    renderDuplicateAlert(
        matches
    );

}


function findPotentialDuplicateComplaints(
    candidate
) {

    const complaints =
        getComplaints();


    return Object
        .values(
            complaints
        )
        .map(
            (complaint) => {

                const match =
                    calculateDuplicateMatch(
                        candidate,
                        complaint
                    );


                return match
                    ? {
                        ...match,
                        id:
                            complaint.id,
                        issue:
                            complaint.issue,
                        status:
                            complaint.status,
                        createdAt:
                            complaint.createdAt
                    }
                    : null;

            }
        )
        .filter(Boolean)
        .sort(
            (a, b) =>
                b.score -
                a.score
        );

}


function calculateDuplicateMatch(
    candidate,
    complaint
) {

    if (
        !complaint
    ) {

        return null;

    }


    let score =
        0;

    const reasons = [];


    if (
        candidate.fileHash &&
        complaint.fileHash &&
        candidate.fileHash ===
            complaint.fileHash
    ) {

        score =
            Math.max(
                score,
                100
            );

        reasons.push(
            "Identical image file"
        );

    }


    const sameIssue =
        candidate.issue &&
        complaint.issue &&
        candidate.issue
            .toLowerCase() ===
            complaint.issue
                .toLowerCase();


    if (sameIssue) {

        score =
            Math.max(
                score,
                45
            );

    }


    const sameCategory =
        candidate.category &&
        complaint.category &&
        candidate.category
            .toLowerCase() ===
            complaint.category
                .toLowerCase();


    const distance =
        calculateLocationDistanceMeters(
            candidate.location,
            complaint.location
        );


    if (
        sameIssue &&
        Number.isFinite(
            distance
        )
    ) {

        if (
            distance <= 50
        ) {

            score =
                Math.max(
                    score,
                    95
                );

            reasons.push(
                `Same issue within ${Math.round(distance)} m`
            );

        } else if (
            distance <= 150
        ) {

            score =
                Math.max(
                    score,
                    80
                );

            reasons.push(
                `Same issue within ${Math.round(distance)} m`
            );

        } else if (
            distance <= 400
        ) {

            score =
                Math.max(
                    score,
                    65
                );

            reasons.push(
                `Similar issue within ${Math.round(distance)} m`
            );

        }

    }


    const sameAddress =
        normalizeAddress(
            candidate.location?.address
        ) &&
        normalizeAddress(
            candidate.location?.address
        ) ===
            normalizeAddress(
                complaint.location?.address
            );


    if (
        sameIssue &&
        sameAddress
    ) {

        score =
            Math.max(
                score,
                90
            );

        reasons.push(
            "Same issue and address"
        );

    }


    if (
        !score &&
        sameCategory &&
        Number.isFinite(
            distance
        ) &&
        distance <= 100
    ) {

        score =
            55;

        reasons.push(
            "Same category nearby"
        );

    }


    if (
        score <
        65
    ) {

        return null;

    }


    const reason =
        reasons.length
            ? reasons.join(
                " · "
            )
            : "Likely repeated report";


    return {

        score:
            score,

        reason:
            reason

    };

}


function normalizeAddress(
    address
) {

    return String(
        address ||
        ""
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            " "
        )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


function calculateLocationDistanceMeters(
    a,
    b
) {

    const aLat =
        Number(
            a?.latitude
        );

    const aLng =
        Number(
            a?.longitude
        );

    const bLat =
        Number(
            b?.latitude
        );

    const bLng =
        Number(
            b?.longitude
        );


    if (
        [
            aLat,
            aLng,
            bLat,
            bLng
        ]
            .some(
                (value) =>
                    !Number.isFinite(
                        value
                    )
            )
    ) {

        return null;

    }


    const toRadians =
        (degrees) =>
            degrees *
            Math.PI /
            180;


    const lat1 =
        toRadians(
            aLat
        );

    const lat2 =
        toRadians(
            bLat
        );

    const dLat =
        toRadians(
            bLat -
            aLat
        );

    const dLng =
        toRadians(
            bLng -
            aLng
        );


    const haversine =
        Math.sin(
            dLat / 2
        ) ** 2 +
        Math.cos(
            lat1
        ) *
        Math.cos(
            lat2
        ) *
        Math.sin(
            dLng / 2
        ) ** 2;


    return (
        6371000 *
        2 *
        Math.atan2(
            Math.sqrt(
                haversine
            ),
            Math.sqrt(
                1 -
                haversine
            )
        )
    );

}


function renderDuplicateAlert(
    matches
) {

    if (
        !duplicateAlert
    ) {

        return;

    }


    if (
        !matches.length
    ) {

        duplicateAlert.classList.add(
            "hidden"
        );

        duplicateAlert.innerHTML =
            "";

        return;

    }


    const top =
        matches[0];


    duplicateAlert.classList.remove(
        "hidden"
    );


    duplicateAlert.className =
        "duplicate-alert duplicate-warning";


    duplicateAlert.innerHTML = `

        <div class="duplicate-alert-icon">
            !
        </div>

        <div class="duplicate-alert-content">

            <div class="duplicate-alert-head">

                <div>

                    <span class="result-label">
                        REPEATED REPORT DETECTED
                    </span>

                    <h3>
                        ${matches.length}
                        potential duplicate${matches.length === 1 ? "" : "s"} found
                    </h3>

                </div>

                <span class="duplicate-score">
                    ${top.score}% match
                </span>

            </div>

            <p>
                The system found an earlier complaint with matching
                image, issue and/or nearby location. You can still submit this
                report; the authority portal will flag it for review.
            </p>

            <div class="duplicate-list">

                ${matches.slice(0, 3).map(
                    (match) => `
                        <div class="duplicate-item">
                            <strong>${escapeHTML(match.id)}</strong>
                            <span>${escapeHTML(match.issue)}</span>
                            <small>${escapeHTML(match.reason)}</small>
                        </div>
                    `
                ).join("")}

            </div>

        </div>

    `;

}


function renderTrackedDuplicateInfo(
    complaint
) {

    if (
        !trackedDuplicateInfo
    ) {

        return;

    }


    const matches =
        Array.isArray(
            complaint.duplicateMatches
        )
            ? complaint.duplicateMatches
            : [];


    if (
        !matches.length
    ) {

        trackedDuplicateInfo.classList.add(
            "hidden"
        );

        trackedDuplicateInfo.innerHTML =
            "";

        return;

    }


    trackedDuplicateInfo.classList.remove(
        "hidden"
    );


    trackedDuplicateInfo.innerHTML = `

        <div class="tracked-duplicate-head">

            <span class="result-label">
                DUPLICATE CHECK
            </span>

            <strong>
                ${matches.length}
                potential repeat${matches.length === 1 ? "" : "s"} detected
            </strong>

        </div>

        <div class="tracked-duplicate-items">

            ${matches.slice(0, 3).map(
                (match) => `
                    <div>
                        <strong>
                            ${escapeHTML(match.id)}
                        </strong>
                        <span>
                            ${escapeHTML(match.issue || "Similar report")}
                        </span>
                        <small>
                            ${escapeHTML(match.reason || "Matching report signals")}
                        </small>
                    </div>
                `
            ).join("")}

        </div>

    `;

}


function renderTrackedStatusHistory(
    complaint
) {

    if (
        !trackedStatusHistory
    ) {

        return;

    }


    const history =
        Array.isArray(
            complaint.statusHistory
        )
            ? complaint.statusHistory
            : [];


    if (
        history.length <= 1
    ) {

        trackedStatusHistory.classList.add(
            "hidden"
        );

        trackedStatusHistory.innerHTML =
            "";

        return;

    }


    trackedStatusHistory.classList.remove(
        "hidden"
    );


    trackedStatusHistory.innerHTML = `

        <div class="tracked-history-head">

            <span class="result-label">
                STATUS HISTORY
            </span>

            <span>
                ${history.length} updates
            </span>

        </div>

        <div class="tracked-history-list">

            ${history.map(
                (entry) => `
                    <div class="tracked-history-item">
                        <div>
                            <strong>
                                ${escapeHTML(entry.status)}
                            </strong>
                            <span>
                                ${escapeHTML(entry.actor || "Authority")}
                            </span>
                        </div>
                        <time>
                            ${escapeHTML(formatDate(entry.time))}
                        </time>
                    </div>
                `
            ).reverse().join("")}

        </div>

    `;

}


/* =========================================================
   AUTHORITY PORTAL
========================================================= */

function isAuthorityLoggedIn() {

    return (
        sessionStorage.getItem(
            AUTH_SESSION_KEY
        ) ===
        "true"
    );

}


function openAuthorityDashboard() {

    authorityLoginView?.classList.add(
        "hidden"
    );

    authorityDashboard?.classList.remove(
        "hidden"
    );


    renderAuthorityDashboard();

}


function closeAuthorityDashboard() {

    authorityLoginView?.classList.remove(
        "hidden"
    );

    authorityDashboard?.classList.add(
        "hidden"
    );

    if (
        authorityPassword
    ) {

        authorityPassword.value =
            "";

    }

}


authorityLoginForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const username =
            authorityUsername.value.trim();

        const password =
            authorityPassword.value;


        if (
            username ===
                AUTH_CREDENTIALS.username &&
            password ===
                AUTH_CREDENTIALS.password
        ) {

            sessionStorage.setItem(
                AUTH_SESSION_KEY,
                "true"
            );


            authorityLoginError.classList.add(
                "hidden"
            );


            openAuthorityDashboard();

        } else {

            authorityLoginError.classList.remove(
                "hidden"
            );


            authorityPassword.value =
                "";


            authorityPassword.focus();

        }

    }
);


authorityLogoutButton?.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            AUTH_SESSION_KEY
        );


        closeAuthorityDashboard();

    }
);


authoritySearch?.addEventListener(
    "input",
    renderAuthorityDashboard
);


authorityStatusFilter?.addEventListener(
    "change",
    renderAuthorityDashboard
);


function renderAuthorityDashboard() {

    if (
        !isAuthorityLoggedIn()
    ) {

        return;

    }


    const complaints =
        Object
            .values(
                getComplaints()
            )
            .sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            );


    const query =
        authoritySearch?.value
            .trim()
            .toLowerCase() ||
        "";


    const statusFilter =
        authorityStatusFilter?.value ||
        "All";


    const filtered =
        complaints.filter(
            (complaint) => {

                const haystack = [
                    complaint.id,
                    complaint.issue,
                    complaint.category,
                    complaint.department,
                    normalizeLocationForDisplay(
                        complaint.location
                    )
                ]
                    .join(" ")
                    .toLowerCase();


                const matchesQuery =
                    !query ||
                    haystack.includes(
                        query
                    );


                const matchesStatus =
                    statusFilter ===
                        "All" ||
                    complaint.status ===
                        statusFilter;


                return (
                    matchesQuery &&
                    matchesStatus
                );

            }
        );


    renderAuthorityStats(
        complaints
    );


    authorityResultsCount.textContent =
        `${filtered.length} report${filtered.length === 1 ? "" : "s"}`;


    authorityComplaintList.innerHTML =
        "";


    authorityEmpty.classList.toggle(
        "hidden",
        filtered.length > 0
    );


    filtered.forEach(
        (complaint) => {

            authorityComplaintList.appendChild(
                createAuthorityComplaintCard(
                    complaint
                )
            );

        }
    );

}


function renderAuthorityStats(
    complaints
) {

    const count =
        (status) =>
            complaints.filter(
                (complaint) =>
                    complaint.status ===
                    status
            ).length;


    const duplicateCount =
        complaints.filter(
            (complaint) =>
                complaint.hasPotentialDuplicate
        ).length;


    const stats = [

        [
            "Total reports",
            complaints.length,
            "↗"
        ],

        [
            "Under review",
            count("Under Review"),
            "◌"
        ],

        [
            "In progress",
            count("In Progress"),
            "→"
        ],

        [
            "Resolved",
            count("Resolved"),
            "✓"
        ],

        [
            "Potential repeats",
            duplicateCount,
            "!"
        ]

    ];


    authorityStats.innerHTML =
        stats
            .map(
                ([label, value, icon]) => `
                    <div class="authority-stat">
                        <span>${escapeHTML(icon)}</span>
                        <strong>${value}</strong>
                        <small>${escapeHTML(label)}</small>
                    </div>
                `
            )
            .join("");

}


function createAuthorityComplaintCard(
    complaint
) {

    const wrapper =
        document.createElement(
            "article"
        );


    wrapper.className =
        "authority-complaint-card";


    const duplicateText =
        complaint.hasPotentialDuplicate
            ? `${complaint.duplicateMatches?.length || 1} potential repeat${
                (complaint.duplicateMatches?.length || 1) === 1
                    ? ""
                    : "s"
              }`
            : "No duplicate flag";


    wrapper.innerHTML = `

        <div class="authority-complaint-main">

            <div class="authority-complaint-head">

                <div>

                    <span class="result-label">
                        ${escapeHTML(complaint.id)}
                    </span>

                    <h4>
                        ${escapeHTML(complaint.issue)}
                    </h4>

                </div>

                <span
                    class="status-pill status-${escapeHTML(
                        complaint.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                    )}"
                >
                    ${escapeHTML(complaint.status)}
                </span>

            </div>


            <div class="authority-complaint-grid">

                <div>
                    <span>Department</span>
                    <strong>${escapeHTML(complaint.department)}</strong>
                </div>

                <div>
                    <span>Location</span>
                    <strong>${escapeHTML(
                        normalizeLocationForDisplay(
                            complaint.location
                        )
                    )}</strong>
                </div>

                <div>
                    <span>Created</span>
                    <strong>${escapeHTML(
                        formatDate(
                            complaint.createdAt
                        )
                    )}</strong>
                </div>

                <div>
                    <span>Duplicate detection</span>
                    <strong class="${
                        complaint.hasPotentialDuplicate
                            ? "duplicate-inline"
                            : ""
                    }">
                        ${escapeHTML(duplicateText)}
                    </strong>
                </div>

            </div>

        </div>


        <div class="authority-complaint-actions">

            <label>
                Update status
                <select
                    class="authority-status-select"
                    data-complaint-id="${escapeHTML(complaint.id)}"
                >
                    ${AUTHORITY_STATUSES.map(
                        (status) => `
                            <option
                                value="${escapeHTML(status)}"
                                ${status === complaint.status ? "selected" : ""}
                            >
                                ${escapeHTML(status)}
                            </option>
                        `
                    ).join("")}
                </select>
            </label>

            <button
                type="button"
                class="button button-light authority-track-button"
                data-track-id="${escapeHTML(complaint.id)}"
            >
                Open tracker
            </button>

        </div>

    `;


    wrapper
        .querySelector(
            ".authority-status-select"
        )
        ?.addEventListener(
            "change",
            (event) => {

                updateComplaintStatus(
                    complaint.id,
                    event.target.value
                );

            }
        );


    wrapper
        .querySelector(
            ".authority-track-button"
        )
        ?.addEventListener(
            "click",
            () => {

                trackInput.value =
                    complaint.id;

                trackComplaint();

                document
                    .getElementById(
                        "track"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


    return wrapper;

}


function updateComplaintStatus(
    id,
    nextStatus
) {

    if (
        !AUTHORITY_STATUSES.includes(
            nextStatus
        )
    ) {

        return;

    }


    const complaints =
        getComplaints();


    const complaint =
        complaints[id];


    if (
        !complaint
    ) {

        return;

    }


    const previousStatus =
        complaint.status;


    if (
        previousStatus ===
        nextStatus
    ) {

        return;

    }


    const now =
        Date.now();


    complaint.status =
        nextStatus;


    if (
        !Array.isArray(
            complaint.statusHistory
        )
    ) {

        complaint.statusHistory =
            [];

    }


    complaint.statusHistory.push({
        status:
            nextStatus,

        time:
            now,

        actor:
            "Authority"
    });


    syncComplaintTimeline(
        complaint
    );


    complaint.updatedAt =
        now;


    complaints[id] =
        complaint;


    saveComplaints(
        complaints
    );


    renderAuthorityDashboard();


    if (
        trackInput.value
            .trim()
            .toUpperCase() ===
        id.toUpperCase()
    ) {

        renderTrackedComplaint(
            complaint
        );

    }


    showAuthorityToast(
        `${id} moved from ${previousStatus} to ${nextStatus}.`
    );

}


function syncComplaintTimeline(
    complaint
) {

    const timeline =
        Array.isArray(
            complaint.timeline
        )
            ? complaint.timeline
            : createDefaultTimeline(
                complaint.createdAt,
                complaint.department
            );


    while (
        timeline.length <
        4
    ) {

        timeline.push(
            {
                title:
                    "",
                description:
                    "",
                time:
                    null,
                done:
                    false
            }
        );

    }


    const stage =
        STATUS_STAGE[
            complaint.status
        ] ?? 0;


    timeline[0].done =
        true;


    timeline[1].done =
        stage >= 1;

    timeline[2].done =
        stage >= 3;

    timeline[3].done =
        stage >= 4;


    const history =
        complaint.statusHistory || [];


    const findTime =
        (statusNames) => {

            const entry =
                [...history]
                    .reverse()
                    .find(
                        (item) =>
                            statusNames.includes(
                                item.status
                            )
                    );

            return entry?.time ||
                null;

        };


    timeline[1].time =
        findTime([
            "Under Review",
            "Assigned",
            "In Progress",
            "Resolved",
            "Rejected"
        ]);

    timeline[2].time =
        findTime([
            "In Progress",
            "Resolved"
        ]);

    timeline[3].time =
        findTime([
            "Resolved"
        ]);


    if (
        complaint.status ===
        "Rejected"
    ) {

        timeline[2].title =
            "Authority review outcome";

        timeline[2].description =
            "The report was reviewed and marked as rejected.";

        timeline[2].done =
            true;

        timeline[2].time =
            findTime([
                "Rejected"
            ]);

    } else {

        timeline[2].title =
            "Action in progress";

        timeline[2].description =
            "Updates will appear here when the report progresses.";

    }


    timeline[3].title =
        "Resolved";

    timeline[3].description =
        "The civic issue has been marked as resolved.";


    complaint.timeline =
        timeline;

}


function showAuthorityToast(
    message
) {

    let toast =
        document.getElementById(
            "authorityToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "authorityToast";

        toast.className =
            "authority-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    requestAnimationFrame(
        () => {
            toast.classList.add(
                "show"
            );
        }
    );


    setTimeout(
        () => {
            toast.classList.remove(
                "show"
            );
        },
        2600
    );

}


/* =========================================================
   HOOK NEW FEATURES INTO EXISTING LOCATION FLOW
========================================================= */

/*
    Existing GPS/manual-location logic remains intact. The hooks below
    only run the duplicate detector once an analysis and a location
    are both available.
*/

const originalSaveManualLocation =
    saveManualLocation;

const originalGetLocation =
    getLocation;


/*
    The named function declarations above already own the existing
    handlers. Rebind the location buttons so we can refresh the
    duplicate detector after the original function completes.
*/

getGpsButton?.removeEventListener(
    "click",
    getLocation
);

getGpsButton?.addEventListener(
    "click",
    () => {

        originalGetLocation();

        setTimeout(
            refreshDuplicateDetection,
            120
        );

    }
);


saveManualLocationButton?.removeEventListener(
    "click",
    saveManualLocation
);

saveManualLocationButton?.addEventListener(
    "click",
    () => {

        originalSaveManualLocation();

        setTimeout(
            refreshDuplicateDetection,
            60
        );

    }
);


window.addEventListener(
    "storage",
    (event) => {

        if (
            event.key ===
            STORAGE_KEY
        ) {

            if (
                isAuthorityLoggedIn()
            ) {

                renderAuthorityDashboard();

            }


            const currentId =
                trackInput?.value
                    .trim()
                    .toUpperCase();


            if (
                currentId
            ) {

                const complaints =
                    getComplaints();


                if (
                    complaints[currentId]
                ) {

                    renderTrackedComplaint(
                        complaints[currentId]
                    );

                }

            }

        }

    }
);


/* =========================================================
   RESTORE AUTHORITY SESSION
========================================================= */

if (
    isAuthorityLoggedIn()
) {

    openAuthorityDashboard();

}


/* =========================================================
   UPDATED CONSOLE DIAGNOSTICS
========================================================= */

console.log(
    "Metadata inspection: EXIF/XMP/provenance heuristics enabled."
);

console.log(
    "Duplicate detection: file hash + issue/location similarity enabled."
);

console.log(
    "Authority portal: browser-only demo authentication and status workflow enabled."
);
