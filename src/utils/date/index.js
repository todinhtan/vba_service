function calculateAgeFromUnix(unixTime) {
  const ageDifMs = Date.now() - unixTime;
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export default {
  calculateAgeFromUnix: unix => calculateAgeFromUnix(unix),
};
