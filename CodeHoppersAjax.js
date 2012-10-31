/*for ajax calls :D */

if(window.CH == undefined){
    window.CH = {};
}

CH.AJAX_URL="./dashboard_request.jsp"; 

CH.Ajax=function(){}
CH.Ajax.prototype.request=function(param){
    this.request(param,CH.AJAX_URL);
}
CH.Ajax.prototype.request=function(param,url){
    //CH.Loader.show();
    var oThis=this;
    jQuery.ajax({
        url:CH.AJAX_URL,
        type:"POST",
        cache:false,
        data:param, //parameters
        success:function(data){
            //CH.Loader.hide();
            oThis.afterSuccess(data);
        },
        error:function(xhr,textStatus,errorThrown){
            //alert("NetworkError: "+textStatus+","+errorThrown);
            CH.Loader.hide();
            oThis.onError(xhr,textStatus,errorThrown);
            
        }
    });
        
    
}
CH.Ajax.prototype.afterSuccess=function(data){
    alert("Please override afterSuccess= with function(data){}");
};

CH.Ajax.prototype.onError=function(xhr,textStatus,errorThrown){
    alert("NetworkError: "+textStatus+","+errorThrown);
}