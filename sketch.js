const halfWidth = window.innerWidth / 2;
const halfHeight = window.innerHeight / 2;

let fps;
let fpsSamples = [];
let fpsTotal = 0;
let rendererUsed;
let manyCircles;
let useBuildGeometry;

async function setup() {
    rendererUsed = WEBGPU;
    await createCanvas(windowWidth, windowHeight, rendererUsed);

    pixelDensity(2);
    manyCircles = false;
    useBuildGeometry = false;

    fps = createP();
    fps.style("font-size", "3vw");
    fps.position(0, 0);
}

function drawSomeCircles() {
    let x = mouseX - halfWidth;
    let y = mouseY - halfHeight;

    circle(x, y, 100);
    if (manyCircles) {
        circle(x, y, 90);
        circle(x, y, 80);
        circle(x, y, 70);
        circle(x, y, 60);
        circle(x, y, 50);
        circle(x, y, 40);
        circle(x, y, 30);
        circle(x, y, 20);
        circle(x, y, 10);
    }
}
function draw() {
    background(200);

    //TODO: is it necessary to dispose of the geometry?
    if (useBuildGeometry) {
        model(buildGeometry(drawSomeCircles));
    } else {
        drawSomeCircles();
    }

    reportFrameRateEtc();
}

function reportFrameRateEtc() {
    const r = frameRate();
    fpsTotal += r;
    fpsSamples.push(r);
    if (fpsSamples.length > 60) {
        fpsTotal -= fpsSamples.shift();
    }
    const fpsAvg = fpsTotal / fpsSamples.length;
    const reportLines = [
        `FPS avg: ` + round(fpsAvg),
        `delta time avg: ${(1000 / fpsAvg).toFixed(2)}ms`,
        `res: ${round(width)} x ${round(height)}`,
        `pd: ` + pixelDensity(),
        `renderer: ${rendererUsed}`,
        `manyCircles ('c' toggles): ${manyCircles}`,
        `useBuildGeometry ('g' toggles): ${useBuildGeometry}`,
    ];

    fps.html(reportLines.join("<br>\n"));
    return reportLines;
}

function keyPressed() {
    if (key === "c") {
        manyCircles = !manyCircles;
    }
    if (key === "g") {
        useBuildGeometry = !useBuildGeometry;
    }
    if (key === "!") {
        useABurstOfCPU(6000);
    }
    //report measurements to console and clipboard
    if (key === "r") {
        const txt = reportFrameRateEtc().join("\n");
        console.log(txt, "\n(copied to clipboard)");
        navigator.clipboard.writeText(txt);
    }
}

//this can be useful for making a visible marker in the recorded trace.
//It just keeps a CPU thread busy for durationMs.
function useABurstOfCPU(durationMs = 2000) {
    let sum = 0;
    let startTime = performance.now();
    while (performance.now() - startTime < durationMs) {
        for (let i = 0; i < 100000; i++) {
            sum += noise(i * 10);
        }
    }
    let elapsedTime = performance.now() - startTime;
    console.log(
        "Finished CPU burst after " +
            round(elapsedTime) +
            "ms, ending " +
            new Date(),
    );
}
