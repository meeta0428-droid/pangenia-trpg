
// Logic from script.js
function calculateCost(n) {
    if (n === 1) return 5;
    return 10 * Math.floor(n / 2);
}

// Verification mechanism
const tests = [
    { n: 1, expected: 5 },
    { n: 2, expected: 10 },
    { n: 3, expected: 10 },
    { n: 4, expected: 20 },
    { n: 5, expected: 20 },
    { n: 6, expected: 30 },
    { n: 7, expected: 30 },
    { n: 8, expected: 40 },
    { n: 9, expected: 40 }, // Assumed
];

let failed = false;
console.log("Running logic verification...");

tests.forEach(test => {
    const result = calculateCost(test.n);
    if (result !== test.expected) {
        console.error(`FAILED: n=${test.n}, expected ${test.expected}, got ${result}`);
        failed = true;
    } else {
        console.log(`PASS: n=${test.n} -> ${result}`);
    }
});

// Test cumulative cost logic
console.log("\nTesting cumulative cost scenario:");
// Simulate increasing stats:
// 1. Str (1st): 5
// 2. Str (2nd): 10
// 3. Dex (3rd): 10
// Total should be 25
let totalCost = 0;
let history = [];

// Step 1
history.push({}); // 1st growth
totalCost += calculateCost(history.length);
console.log(`After 1st growth: Total ${totalCost} (Expected 5)`);

// Step 2
history.push({}); // 2nd growth
totalCost += calculateCost(history.length);
console.log(`After 2nd growth: Total ${totalCost} (Expected 15)`);

// Step 3
history.push({}); // 3rd growth
totalCost += calculateCost(history.length);
console.log(`After 3rd growth: Total ${totalCost} (Expected 25)`);

if (!failed && totalCost === 25) {
    console.log("\nALL TESTS PASSED");
} else {
    console.error("\nTESTS FAILED");
    process.exit(1);
}
