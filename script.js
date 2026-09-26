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


/* =========================================================
   LOCAL STORAGE KEY
========================================================= */

const STORAGE_KEY =
    "civicconnect_complaints_v2";


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

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    } catch {

        return {};

    }

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


function createComplaint() {

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


    const id =
        generateComplaintId();


    const createdAt =
        Date.now();


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

        status:

            "Submitted",

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