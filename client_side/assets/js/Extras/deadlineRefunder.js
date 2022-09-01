//This class is to set the deadline (in days) that users can refund their donation/purchase.

//https://javascript.info/property-accessors
let DeadlineRefunder =
{
    //Default amount of days user can refund their donation/purchase.
    deadlineDayRefund: 30,

    set setDaysUserCanRefund(deadlineDayRefund)
    {
        this.deadlineDayRefund = deadlineDayRefund;
    },

    get getDaysUserCanRefund()
    {
        return this.deadlineDayRefund;
    }
}