const WEI_PER_ETH = BigInt("1000000000000000000");

export function formatWeiToEth(wei: string): string {
  const weiValue = BigInt(wei || "0");
  const whole = weiValue / WEI_PER_ETH;
  const fraction = weiValue % WEI_PER_ETH;
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, 6);
  if (fractionStr === "000000") {
    return `${whole.toString()} ETH`;
  }
  return `${whole.toString()}.${fractionStr} ETH`;
}

export function formatWeiToUsd(
  wei: string,
  usdPerEth = 3500,
): string {
  const weiValue = BigInt(wei || "0");
  const whole = weiValue / WEI_PER_ETH;
  const fraction = weiValue % WEI_PER_ETH;
  const eth = Number(whole) + Number(fraction) / 1e18;
  const usd = eth * usdPerEth;
  return `$${usd.toFixed(2)}`;
}
