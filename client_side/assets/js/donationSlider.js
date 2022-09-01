$(function()
{
    $("#slider").slider({
        animate: true,
        value: 0,
        min: 0.1,
        max: 1,
        step: 0.1,
        slide: function(event, ui) {
            update(1,ui.value); //changed
        }
    });

    //Added, set initial value.
    $("#donation-amount").val(0.1);
    $("#amount-label").text(0.1);
    
    update();
});

//changed. now with parameter
function update(slider, val)
{
  //changed. Now, directly take value from ui.value. if not set (initial, will use current value.)
  var $donationAmount = slider == 1?val:$("#donation-amount").val();

   $( "#donation-amount" ).val($donationAmount);
   $( "#amount-label" ).text($donationAmount);

   $('#slider a').html('<label><i class="fa fa-angle-left fa-lg" style="margin-right:10px"></i>'+$donationAmount+' <i class="fa fa-angle-right fa-lg" style="margin-left:5px"></i></label>');
}

//Close the ".donation-slider-modal" when x button is pressed.
$(".close").on("click", function()
{
    $(".modal").removeClass("is-active");
});