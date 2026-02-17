
import math

def calculate_cost(n):
    if n == 1:
        return 5
    return 10 * math.floor(n / 2)

tests = [
    (1, 5),
    (2, 10),
    (3, 10),
    (4, 20),
    (5, 20),
    (6, 30),
    (7, 30),
    (8, 40),
    (9, 40)
]

failed = False
print("Running logic verification...")

for n, expected in tests:
    result = calculate_cost(n)
    if result != expected:
        print(f"FAILED: n={n}, expected {expected}, got {result}")
        failed = True
    else:
        print(f"PASS: n={n} -> {result}")

total_cost = 0
history_len = 0

# 1st growth
history_len += 1
cost1 = calculate_cost(history_len)
total_cost += cost1
print(f"After 1st growth: Cost {cost1}, Total {total_cost} (Expected 5)")

# 2nd growth
history_len += 1
cost2 = calculate_cost(history_len)
total_cost += cost2
print(f"After 2nd growth: Cost {cost2}, Total {total_cost} (Expected 15)")

# 3rd growth
history_len += 1
cost3 = calculate_cost(history_len)
total_cost += cost3
print(f"After 3rd growth: Cost {cost3}, Total {total_cost} (Expected 25)")

if not failed and total_cost == 25:
    print("\nALL TESTS PASSED")
else:
    print("\nTESTS FAILED")
