//This javascript file will convert the date time (the date the donation/purchase was made, or the days the user can refund) into seconds because solidity
//can't handle date time.

//This converts the current date the donation/purchase was made.
//dateToConvert is in milliseconds since epoch (1970).
function convertCurrentDateToSeconds(dateToConvert)
{
    return Math.round(dateToConvert / 1000);
}

//This converts the deadline day users can refund.
function convertDeadlineDayToSeconds(deadlineDayRefund)
{
    //The amount of days user can refund * 1 day (in hours) * 60 minutes * 60 seconds.
    return deadlineDayRefund * 24 * 60 * 60;
}