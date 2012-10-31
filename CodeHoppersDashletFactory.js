if(window.CH == undefined){
    window.CH = {};

}


CH.DashletFactory={
    
    createDashlet:function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
        
        var temp="CH."+dashType+"Dashlet"; 
        temp="var dashlet = new "+temp+"(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId);";
        eval(temp);
        
        return dashlet;
    },
    createEmptyDashlet:function(){
        var dashlet=new CH.Dashlet();
        return dashlet;
    }
    
}







