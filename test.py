import math

def price_to_tick(p):
    return math.floor(math.log(p, 1.0001))

q96 = 2**96
def price_to_sqrtp(p):
    return int(math.sqrt(p) * q96)

print(price_to_sqrtp(1))
print(price_to_tick(1))
