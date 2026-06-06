export function isTimestampWithinTolerance(
  sourceATimestamp: string,

  sourceBTimestamp: string,

  toleranceInMinutes = 5
): boolean {
  const sourceADate =
    new Date(sourceATimestamp);

  const sourceBDate =
    new Date(sourceBTimestamp);

  const differenceInMs =
    Math.abs(
      sourceADate.getTime() -
      sourceBDate.getTime()
    );

  const toleranceInMs =
    toleranceInMinutes *
    60 *
    1000;

  return differenceInMs <= toleranceInMs;
}