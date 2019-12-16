const exponential = 2.718281828;

function fact(x) {
  if (x === 0) {
    return 1;
  }

  return x * fact(x - 1);
}

function poisson(k, landa) {
  const exponentialPower = Math.pow(exponential, -landa); // negative power k
  const landaPowerK = Math.pow(landa, k); // Landa elevated k
  const numerator = exponentialPower * landaPowerK;
  const denominator = fact(k); // factorial of k.

  return (numerator / denominator);
}

module.exports = {poisson};