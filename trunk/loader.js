if(window.CH == undefined){
    window.CH = {};
}

CH.Loader = {
    loaderDiag : null,
    show:function(){
        var oThis=this;
        if(!oThis.loaderDiag){
            //initialize loader
            oThis.loaderDiag = jQuery('#jLoader').dialog({
                autoOpen: false,
                minWidth : 0,
                minHeight : 0,
                width: 80,
                modal: true,
                cache:false,
                draggable: false,
                resizable:false,
                open: function(event, ui) {
                    
                    jQuery(this).parent().children().children('.ui-dialog-titlebar-close').hide();
                }
            });
        }
        jQuery('#jLoader').dialog('open');
    },
    hide:function(){
        jQuery('#jLoader').dialog('close');
    }

};

