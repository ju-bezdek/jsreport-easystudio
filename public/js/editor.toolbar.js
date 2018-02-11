

function addButtonClickEvent() {
    $('div#' + jsReportEasyStudioEditor.constants.mainMenuDivId+ '.nav li a').click(function () {
        if (this.getAttribute('disabled')){
            return;
        }
        if(!$(this).hasClass('active')){
            var showId = this.getAttribute('show');
            if (!showId){
                return;
            }
            var elementToShow = $(showId);
            
            elementToShow.removeClass('hidden');
            
            $('div#' + jsReportEasyStudioEditor.constants.mainMenuDivId+ '.nav li a.active').each(function(i,e){
                $(e).removeClass('active');
                var showEle = $(e.getAttribute('show'));
                showEle.removeClass('visible');
                showEle.trigger('onBeforeHide');
                showEle.addClass('hidden');
                showEle.trigger('onHiden');
                
            });
            
            $(this).addClass('active');
            elementToShow.trigger('onBeforeShow');
            elementToShow.addClass('visible');
            elementToShow.trigger('onShown');
            
        }
    });
}


$(window).on("load",function() {
   
    addButtonClickEvent();
});