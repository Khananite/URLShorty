$(function()
{
    detectWeb3();
})

function detectWeb3()
{
    let ethereum = window.ethereum;
    if (typeof ethereum == 'undefined')
    {
        $(".metamask-modal").addClass("is-active");  
        console.log('METAMASK NOT DETECTED');
    }
}

//Close the above modal when x button is pressed.
$(".close").on("click", function()
{
    $(".modal").removeClass("is-active");
});