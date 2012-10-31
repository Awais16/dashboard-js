if(window.CH == undefined){
    window.CH = {};
}

CH.IFRAME_WIDTH_DIST=30;
CH.IFRAME_HEIGHT_DIST=60;

CH.JFREEGRAPH_WIDTH_DIST=70;
CH.JFREEGRAPH_HEIGHT_DIST=70;

CH.DEFAULT_DASHLET_WIDTH=400;
CH.DEFAULT_DASHLET_HEIGHT=300;

CH.DEFAULT_DIALOG_WIDTH=700;
CH.DEFAULT_DIALOG_HEIGHT=600;

CH.COLUMN_MAX_DIFF=10;


CH.Dashboard = {
    
    dashboardId:"",
    dashlets:[],
    mainDiv:"",
    maxColId:-1,
    readOnly:true,
    personId:0,
    dashboardName:"",
    isPublic:true,
    viewType:0,
    windowWidth:0,
    windowHeight:0,
    fl_windowDecreased:false,
    sumWidth:0,

    init:function(dashboardId,readOnly,personId,dashboardName,isPublic){
        this.dashboardId=dashboardId;
        this.readOnly=readOnly;
        this.personId=personId;
        this.dashboardName=dashboardName;
        this.usPublic=isPublic;
    },
    addDashlet:function(dashlet){
        var temp=dashlet;
        this.dashlets.push(temp);
    },    
    drawDashlets:function(mainDiv){
        this.mainDiv=mainDiv;

        this.setDashboardName();

        if(this.dashlets.length==0){
            $(mainDiv).html("<div class='column' id='col_0'></div>");
        }
        for(var i=0;i<this.dashlets.length;i++){
            this.dashlets[i].draw(this.mainDiv);
            this.dashlets[i].render("#content_"+this.dashlets[i].dashId);
        }
        
        if(this.dashlets.length!=0){
            this.adjustAllColWidth(this.mainDiv);
        }
        
        this.initSortable(".column");
        this.initResizable(".portlet");
        
        
    },
    adjustColWidth:function(columnId){
        var minWidth=0;
        
        for (var i=0; i < $(columnId).children('.portlet').length; i++) {
            var jportlet=$(columnId).children('.portlet')[i];
            if(minWidth<$(jportlet).outerWidth()){
                minWidth=$(jportlet).outerWidth();
            }
        }

        if($.browser.msie){
            
            $(columnId).animate({
                width:minWidth+CH.COLUMN_MAX_DIFF
            },500); //time of animation 0.5sec
        }
        else{
            $(columnId).animate({
                width:minWidth
            },500); //time of animation 0.5sec
        }
        
        if(minWidth==0){
            var temp=$(".column");
            if(temp.length>1){
                $(columnId).remove();
            }
            else{
                $(columnId).animate({
                    width:CH.DEFAULT_DASHLET_WIDTH+20
                },500);
            }

        }
    },
    adjustColWidthNoAnim:function(columnId){
        var minWidth=0;
        
        for (var i=0; i < $(columnId).children('.portlet').length; i++) {
            var jportlet=$(columnId).children('.portlet')[i];
            if(minWidth<$(jportlet).outerWidth()){
                minWidth=$(jportlet).outerWidth();
            }
        }

        if($.browser.msie){
            $(columnId).width(minWidth+CH.COLUMN_MAX_DIFF);
        }
        else{
            $(columnId).width(minWidth);
        }
        
        if(minWidth==0){
            var temp=$(".column");
            if(temp.length>1){
                $(columnId).remove();
            }
            else{
                $(columnId).width(CH.DEFAULT_DASHLET_WIDTH+20);
            }

        }
    },
    adjustAllColWidth:function(mainDiv){
        var cols=$(mainDiv).children(".column");
        for(var i=0;i<cols.length;i++){
            this.adjustColWidthNoAnim("#"+$(cols[i]).attr("id"));
        }
        
    },
    initSortable:function(selector){

        /*Note: Function updated, not using the selector*/
        
        $(".column").sortable("destroy");

        var currentColId="";
        var oThis=this;
        if(!oThis.readOnly){

            //$(selector).sortable({
            $(".column").sortable({
                iframeFix: true,
                tolerance:'pointer',
                handle:".portlet-header",
                /*connectWith: selector,*/
                connectWith:".column",
                forcePlaceholderSize: true,
                start:function(event,ui){

                    var colId=$(this).prop("id");
                    currentColId="#"+colId;
                    
                    var dashId=$(ui.item).attr("id");
                    
                    dashId=dashId.substr((dashId.indexOf("_")+1),dashId.length);

                    var ind=CH.Dashboard.findIndex(dashId);
                    var dashlet=CH.Dashboard.dashlets[ind];

                    $(".ui-sortable-placeholder").width(dashlet.dashWidth);
                    $(".ui-sortable-placeholder").height(dashlet.dashHeight);

                },
                remove:function(event,ui){
                    
                    var colId="#"+$(this).attr("id");
                    oThis.adjustColWidth(colId);
                    currentColId=colId;
                    
                },
                receive:function(event,ui){
                    var colId="#"+$(this).attr("id");
                    
                    oThis.adjustColWidth(colId);
                    currentColId=colId;
         
                },
                stop:function(event,ui){

                    var colId=currentColId;
                  
                    var dashId=$(ui.item).attr("id");
                    var order=$("#"+dashId).index();

                    dashId=dashId.substr(dashId.indexOf("_")+1,dashId.length);
                    var ind=oThis.findIndex(dashId);

                    oThis.dashlets[ind].dashColId=colId;
                    
                    var col=$(colId);
                    var colInd=$(colId).index();
                     
                    for(var j=0;j<$(col).children(".portlet").length;j++){
                        
                        var portlet=$(col).children(".portlet")[j];

                        var colId=$(col).attr("id");
                        
                        colId=colId.substr(colId.indexOf("_")+1,colId.length);
                        var dashid=(portlet.id).substr((portlet.id).indexOf("_")+1, (portlet.id).length);
                        var ind=oThis.findIndex(dashid);
                        if(ind!="-1"){
                            oThis.dashlets[ind].dashOrder=j;
                            oThis.dashlets[ind].dashColId=colId;
                            oThis.dashlets[ind].dashColOrder=colInd;
                            //log.err(JSON.stringify(oThis.dashlets[ind]));
                            oThis.dashlets[ind].update();
                        }
                    }
                },
                opacity: 0.4
            });
        }
    },
    initResizable:function(selector){
        
        /**put that in dashlet class later**/
        
        var oThis=this;

        var cloneFrame;
        
        if(!oThis.readOnly){
            $(selector).resizable({
                
                stop:function(event,ui){ //adjust col width
                    
                    var dash=this;
                    var dashId=$(dash).attr("id");
                    var width=$("#"+dashId).width();
                    var height=$("#"+dashId).height();

                    var fh=$("#"+dashId).innerHeight()-CH.IFRAME_HEIGHT_DIST;
                    var fw=$("#"+dashId).innerWidth()-CH.IFRAME_WIDTH_DIST;
                    

                    //add cloned
                    

                    dashId=dashId.substr(dashId.indexOf("_")+1,dashId.length);
                    var ind=oThis.findIndex(dashId);
                    oThis.dashlets[ind].dashWidth=width;
                    oThis.dashlets[ind].dashHeight=height;
                     
                    oThis.dashlets[ind].update();
 
                    var dashlet=oThis.dashlets[ind];
                    if(dashlet.dashType=="Url" || dashlet.dashType=="GraphTable"){
                        
                        //for ie
                        
                        $(cloneFrame).attr("width",fw);
                        $(cloneFrame).attr("height",fh);

                        $(cloneFrame).css("width",fw);
                        $(cloneFrame).css("height",fh);
                        
                        $("#content_"+dashId).html(cloneFrame);
                    }
                    
                    var p=$(this).parent();
                    var colId="#"+$(p).attr("id");
                    oThis.adjustColWidth(colId);
                     
                    
                    if(dashlet.dashType=="JFreeChart"){
                        dashlet.render("#content_"+dashlet.dashId);
                    }
                    
                },
                resize:function(event,ui){
                    //resize iframe
                    var dashId=$(this).attr("id");
                    dashId="#"+dashId;
                    //var width=$(dashId).width();
                    //var height=$(dashId).height();
                    
                    var width=ui.size.width;
                    var height=ui.size.height;
                     
                  
                    
                    var imgJfree=$(dashId+" #imgDiv img");
                    
                    if(imgJfree.length>0){

                        $(imgJfree).width((width-CH.JFREEGRAPH_WIDTH_DIST));
                        $(imgJfree).height((height-CH.JFREEGRAPH_HEIGHT_DIST));
                        
                   
                    }
                    
                    var tableau=$(dashId+" #tableau");
                    
                    if(tableau.length>0){

                        $(dashId+" .ifTable").width(width-CH.JFREEGRAPH_WIDTH_DIST);
                        $(dashId+" .ifTable").height(height-CH.JFREEGRAPH_HEIGHT_DIST);
                        
                    }
                    
                    $(dashId+" #mapFrame").width(width-CH.JFREEGRAPH_WIDTH_DIST);
                    $(dashId+" #mapFrame").height(height-CH.JFREEGRAPH_HEIGHT_DIST);
                    

                },
                start:function(event,ui){
                    //                    alert($(event.currentTarget).prop("id"));
                    var dashId=$(this).attr("id");

                    dashId=dashId.substr((dashId.indexOf("_")+1),dashId.length);
                    
                    var dashlet=CH.Dashboard.dashlets[CH.Dashboard.findIndex(dashId)];
                    if(dashlet.dashType=="Url" || dashlet.dashType=="GraphTable"){
                        cloneFrame=$("#content_"+dashId+" iframe").filter(":first").clone(); 
                        $("#content_"+dashId+" iframe").remove();
                    }
                }
            });
        }
       
    },
    disableResizable:function(selector){
        $(selector).resizable("destroy");
    },
    showdashlets:function(){
        for(var i=0;i<this.dashlets.length;i++){
            log.err(this.dashlets[i].dashId);
        }
    },
    findIndex:function(dashId){
       
        var indx=-1;
        for(var i=0;i<this.dashlets.length;i++){
            if(this.dashlets[i].dashId==dashId){
                indx=i;
            }
        }
        return indx;
    },
    removeDashlet:function(indx){
        this.dashlets.splice(parseInt(indx),1);
    },
    setDashboardName:function(){
        var oThis=this;
        $("#dashboardName span").text(this.dashboardName);
        $("#dashboardName span").prop("title","Click to edit name");
        var params={
            type:"updateDashboardName",
            dashboardId:oThis.dashboardId,
            dashboardName:oThis.dashboardName
        };
        if(!this.readOnly){
            $("#dashboardName span").editInPlace({
                //url:"./dashboard_request.jsp",
                saving_animation_color: "#C9C9C9",
                show_buttons:false,
                value_required:true,
                on_blur:null,
                cancel_button:"<button value='Cancel' class=\"inplace_cancel ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only\" type='button' role='button' ><div class='ui-button-text' style='height:10px;font-size:10px;'>Cancel</div></button>",
                save_button:"<button value='Save' class=\"inplace_save ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only\" type='button' role='button'><div class='ui-button-text' style='height:10px;font-size:10px;'>Save</div></button>",
                callback: function(idOfEditor, enteredText, orinalHTMLContent, settingsParams, animationCallbacks) {
                    animationCallbacks.didStartSaving();
                    
                    var aj=new CH.Ajax();
                    aj.afterSuccess=function(data){

                        var resp=eval("("+data+")");
                        if(resp.isError=="0"){
                            animationCallbacks.didEndSaving();
                            $("#dashboardName span").text(enteredText);
                        }
                        else if(resp.isError=="1"){
                            
                            $("#dialog-box").myLog("setTitle","Log");
                            $("#dialog-box").myLog("clear");
                            $("#dialog-box").myLog("centerAlign");
                            $("#dialog-box").myLog("show");
                            $("#dialog-box").myLog("err",resp.error);
                        }
                    }
                    
                    params.dashboardName=enteredText;
                    aj.request(params);
                    return orinalHTMLContent;
                    
                }
            });
            
        }

    },
    initAddColButton:function(selector){
        var oThis=this;
        $(selector).click(function(){
            var aj=new CH.Ajax();
            var param={
                type:"getMaxColId",
                dashboardId:oThis.dashboardId
            };
            if(oThis.maxColId=="-1"){
                aj.request(param);
            }
            else{
                $(oThis.mainDiv).append("<div class='column' id='col_"+oThis.maxColId+"'></div>");
                oThis.initSortable("#col_"+oThis.maxColId);
                oThis.maxColId++;
            }
            aj.afterSuccess=function(data){
                log.debug(data);
                var obj=eval("("+data+")");
                
                if(obj.isError=="0"){
                    //data=parseInt(data)+1;
                    oThis.maxColId=obj.lastColId+1;
                    $(oThis.mainDiv).append("<div class='column' id='col_"+oThis.maxColId+"'></div>");
                    oThis.maxColId++;
                    oThis.initSortable(".column");
                }
                else{
                    log.debug(obj.error);
                }
            }

        });
    },
    initNewDashletButton:function(selector){
        var oThis=this;

        var colId;
        var colOrder;
        var dash="";
        dash.cacheId="";
        
        $(selector).click(function(){

            $("#dd_type").prop("selectedIndex",0);

            var cols=$(oThis.mainDiv).children(".column");
            $("#dd_col").html("");
            
            for(var i=0;i<cols.length;i++){
                var st_html="<option value='"+cols[i].id+"'>"+(i+1)+"</option>"
                $("#dd_col").append(st_html);
            }
            var cont="<div style='margin-top:5px;'><label for='txt_html' style='float:left;'>HTML: </label><textarea rows='10' cols='40' id='txt_html' name='txt_html'>Some Html here</textarea></div>";
            $("#newDashletContent").html(cont);

            colId=$("#dd_col").val();
            
            colId=colId.substr(colId.indexOf("_")+1,colId.length);

            colOrder=$("#col_"+colId).index();

            $("#dd_col").change(function(){
                colId=$(this).val();
                colId=colId.substr(colId.indexOf("_")+1,colId.length);

                colOrder=$("#col_"+colId).index();
            });

            var obj_shareddashlets;
   
            $("#tab0").tabs({
                selected: 0,
                select:function(event,ui){

                    if(ui.index=="0"){

                        var cols=$(oThis.mainDiv).children(".column");
                        $("#dd_col").html("");
                        
                        for(var i=0;i<cols.length;i++){
                            var st_html="<option value='"+cols[i].id+"'>"+(i+1)+"</option>"
                            $("#dd_col").append(st_html);
                        }
                       
                    }
                    else if(ui.index=="1"){

                        $(ui.panel).html("<label for='dname'>Name:</label><input type='text' name='dname' id='inp_xName'/>");
                        $(ui.panel).append("<label for='columnId'>"+CH.lang.insertInColumn+"</label><select id='dd_existing_col' name='columnId'></select>");

                        var cols=$(oThis.mainDiv).children(".column");
                        $("#dd_existing_col").html("");

                        for(var i=0;i<cols.length;i++){
                            var st_html="<option value='"+cols[i].id+"'>"+(i+1)+"</option>"
                            $("#dd_existing_col").append(st_html);
                        }
                        var txtHtml="<div>";
                        txtHtml+="<button id='bt_xPrev' style='float:left'>"+CH.lang.previous+"</button>";
                        txtHtml+="<div style='float:left'><label for='dd_xDashId'>Dashlets</label><select name='dd_xDashId' id='dd_xDashId'></select></div>";
                        txtHtml+="<button id='bt_xNext'>"+CH.lang.next+"</button>";
                        txtHtml+="</div>";
                        txtHtml+="<div id='xSample'><div class='portlet-header ui-widget-header ui-corner-all'>Sample</div><div class='portlet-content' id='content_xSample'>some content in here</div></div>";
                        
                        $(ui.panel).append(txtHtml);

                        $("#bt_xNext").button();
                        $("#bt_xPrev").button();

                        $("#dd_xDashId").attr("disabled",true);

                        $("#xSample").css("border","#000000 1px dotted");
                        $("#xSample").css("width",500);
                        $("#xSample").css("height",300);


                        /*ajax call*/

                        var aj=new CH.Ajax();
                        var param={
                            type:"getSharedDashlets"
                        };
                        aj.afterSuccess=function(data){

                            //alert(data);
                            //log.debug(data);
                            $("#dd_xDashId").attr("disabled",false);
                            
                            var dat=eval("("+data+")");
                            
                            if(dat.isError=="1"){
                                CH.Loader.hide();
                                $("#dialog-box").myLog("setTitle","Log");
                                $("#dialog-box").myLog("clear");
                                $("#dialog-box").myLog("centerAlign");
                                $("#dialog-box").myLog("show");
                                $("#dialog-box").myLog("err",dat.error);
                            }
                            else{
                                obj_shareddashlets=dat.array;
                                if(obj_shareddashlets.length>0){

                                    $("#dd_xDashId").html("");
                                    var i;
                                    for(i=0;i<obj_shareddashlets.length;i++){
                                        $("#dd_xDashId").append("<option value='"+obj_shareddashlets[i].dash_id+"'>"+obj_shareddashlets[i].dash_name+"</option>");
                                    }

                                    //previous button
                                    $("#bt_xPrev").click(function(){
                                        var ind=$("#dd_xDashId").prop("selectedIndex");
                                        if(ind>0){
                                            $("#dd_xDashId").prop("selectedIndex",ind-1);
                                            $("#dd_xDashId").change();
                                        }
                                    });

                                    //next button

                                    $("#bt_xNext").click(function(){
                                        var ind=$("#dd_xDashId").prop("selectedIndex");
                                        if(ind<i-1){
                                            $("#dd_xDashId").prop("selectedIndex",ind+1);
                                            $("#dd_xDashId").change();
                                        }
                                        else{
                                            $("#dd_xDashId").prop("selectedIndex",0);
                                            $("#dd_xDashId").change();
                                        }
                                    });

                                    var dashId=$("#dd_xDashId").val();

                                    var dashWidth=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_width;
                                    var dashHeight=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_height;
                                    var dashType=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_type;
                                    var dashData=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_data;


                                    /*if(obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_width<500){
                                    $("#xSample").css("width",obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_width);
                                    $("#xSample").css("height",obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_height);
                                }*/
                                    //else{
                                    $("#xSample").css("width",500);
                                    $("#xSample").css("height",300);
                                    //}

                                    dashData=JSON.stringify(dashData);
                                    dash=CH.DashletFactory.createDashlet("","",500,300,"",dashType,"0",dashData,"","",oThis.dashboardId);
                                    dash.render("#content_xSample");
                                    CH.Loader.hide();
                                }
                                else{
                                    CH.Loader.hide();
                                    alert("No shared dashlets found");
                                }
                            }
                        }
                        CH.Loader.show();
                        aj.request(param);

                        /*on change*/

                        $("#dd_xDashId").change(function(){
                            // alert("prop="+$("#dd_xDashId").prop("selectedIndex"));
                            var dashId=$(this).val();
                            
                            var dashWidth=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_width;
                            var dashHeight=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_height;
                            var dashType=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_type;
                            var dashData=obj_shareddashlets[$("#dd_xDashId").prop("selectedIndex")].dash_data;

                            $("#xSample").css("width",500);
                            $("#xSample").css("height",300);
                       

                            $("#content_xSample").html("");
                            dashData=JSON.stringify(dashData);
                            
                       
                            var dash2=CH.DashletFactory.createDashlet("#content_xSample","",500,300,"",dashType,"0",dashData,"","",oThis.dashboardId);
                            dash2.render("#content_xSample");
                       
                            
                        });


                    }

                }
            });
            var height="auto";
            if($.browser.msie){
                height="900";
            }
            
            $("#tab0").dialog({
                modal: true,
                resizable:true,
                width:800,
                height:height,
                close:function(eve,ui){
                    $("#newDashletContent").html("");
                    $("#xDashlet").html("");
                },
                create: function(event, ui) {
                //$(".ui-dialog-titlebar").remove();
                },
                open: function(event, ui) {
                    $("#dd_type").attr("selectedIndex",0);
                },
                buttons:{
                    "apply/save":function(){

                        var tabNum=$("#tab0").tabs('option', 'selected');

                        if(tabNum=="0"){

                            var toCol=$("#dd_col").val();
                            
                            var dash_width=CH.DEFAULT_DASHLET_WIDTH;

                            var dash_order=$("#"+toCol).children(".portlet").length;
                            
                            var dash_height=CH.DEFAULT_DASHLET_HEIGHT;

                            var dash_url=$("#inp_url").val();

                            if (dash_url=="undefined"){
                                dash_url="";
                            }

                            var dash_type=$("#dd_type").val();

                            var col_order=$("#"+toCol).index();

                            var colsGraph=$("#dd_que_col").val();

                            var dash_name=$("#inp_newDashName").val();

                            colsGraph=colsGraph+"";

                            toCol=toCol.substr(toCol.indexOf("_")+1,toCol.length);



                            var dashData={};

                            if(dash_type=="Html"){
                                var dhtml=$("#txt_html").val();
                                if(dhtml){
                                    dhtml=dhtml.replace(/\n+/g,"");
                                    dhtml=escape(dhtml);
                                    
                                }
                                dashData={
                                    html:dhtml
                                }
                            }
                            else if(dash_type=="JFreeChart"){
                                dashData={
                                    graphId:'0' // will be updated later
                                }
                            }
                            else if(dash_type=="GraphTable"){
                                dashData={
                                    graphTable:$("#dd_graphTable").val(),
                                    criteria:$("#dd_criteria").val(),
                                    toDate:$("#inp_pro_toDate").val(),
                                    fromDate:$("#inp_pro_fromDate").val()
                                }
                            }
                            else{
                                if(CH.validate.haveHttp("#inp_url")){
                                    dashData={
                                        url:dash_url
                                    }
                                }
                                else{
                                    dashData={
                                        url:"http://"+dash_url
                                    }
                                }
                            }
                            


                            dashData=JSON.stringify(dashData);
                            
                            //function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
                            var dashLocal=CH.DashletFactory.createDashlet("",dash_name,dash_width,dash_height,dash_order,dash_type,"0",dashData,toCol,col_order,oThis.dashboardId);
                            if(CH.validate.isEmpty("#inp_newDashName")){
                            // its empty
                            }
                            else{
                                if(dash_type=="GraphTable"){
                                    if(($("#inp_pro_toDate").val()).length>0 && ($("#inp_pro_fromDate").val()).length>0 ){
                                        dashLocal.save();
                                    }
                                    else{
                                        alert("insert Date");
                                    }
                                }
                                else{
                                    dashLocal.save();
                                }
                                
                            }

                        }
                        else if(tabNum=="1"){

                            var dashName=$("#inp_xName").val();
                            var ind=$("#dd_xDashId").prop("selectedIndex");
                            
                            if(ind=="undefined" || ind=="-1"){
                                alert("No preshared dashlets");
                            }
                            else{
                                //var dashName=obj_shareddashlets[ind].dash_name;
                                
                                var dashId=obj_shareddashlets[ind].dash_id;

                                var dashWidth=CH.DEFAULT_DASHLET_WIDTH;

                                var dashHeight=CH.DEFAULT_DASHLET_HEIGHT;

                                var toCol=$("#dd_existing_col").val();

                                var dashOrder=$("#"+toCol).children(".portlet").length;

                                var dashType=obj_shareddashlets[ind].dash_type;

                                var col_order=$("#"+toCol).index();

                                var dash_data=obj_shareddashlets[ind].dash_data;

                                dash_data=JSON.stringify(dash_data);

                                toCol=toCol.substr(toCol.indexOf("_")+1,toCol.length);

                                var dashLocal=CH.DashletFactory.createDashlet(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,"1",dash_data,toCol,col_order,oThis.dashboardId);
                                
                                dashLocal.saveFromExisting();
                                
                            }
                            
                        //oThis.insertNewDashlet(dashName,oThis.maxDashletId,dashWidth,toCol,dash_order,dashHeight,dash_type,dash_url,col_width,col_order,oThis.dashboardId,colsGraph,cahceId);
                            
                        }
                       

                    },
                    "Done":function(){
                        $( this ).dialog( "close" );
                    }

                }
            });

            
        //dash=CH.DashletFactory.createDashlet("","","","","",$("#dd_type").val(),"0","{}",colId,colOrder,oThis.dashboardId);

            
        }); //on click
        
        $("#dd_type").change(function(){
            $("#newDashletContent").html("");
            
            dash=CH.DashletFactory.createDashlet("","","","","",$(this).val(),"0","{}",colId,colOrder,oThis.dashboardId);
            
            dash.newDashletForm("#newDashletContent");

        });

    },
    initSaveDashboardButton:function(bt_save){
        var oThis=this;
        $(bt_save).click(function(){
            //$("#dialog-box").myLog("setTop",40);
            $("#dialog-box").myLog("setTitle","Log");
            $("#dialog-box").myLog("clear");
            $("#dialog-box").myLog("show");
            for(var i=0;i<$(oThis.mainDiv).children(".column").length;i++){
                var col=$(oThis.mainDiv).children(".column")[i];

                for(var j=0;j<$(col).children(".portlet").length;j++){
                    var portlet=$(col).children(".portlet")[j];

                    var colId=$(col).attr("id");
                    colId=colId.substr(colId.indexOf("_")+1,colId.length);
                    var dashid=(portlet.id).substr((portlet.id).indexOf("_")+1, (portlet.id).length);
                    oThis.updateDashlet(dashid,colId, $(portlet).width(), j,$(portlet).height(), i, oThis.dashboardId);
                }//innerfor

            } //for

            
        });
    },
    updateDashlet:function(dashId,colId,dash_width,order_num,dash_height,col_order,dashboardid){
        var oThis=this;
        var aj=new CH.Ajax();
        
        var ind=oThis.findIndex(dashId);
        
        var param={
            type:"updateDashlet",
            dashId:dashId,
            colId:colId,
            dashWidth:dash_width,
            dashOrder:order_num,
            dashHeight:dash_height,
            colOrder:col_order,
            dashboardId:dashboardid,
            dashData:oThis.dashlets[ind].dashData,
            dashName:oThis.dashlets[ind].dashName
        }

        aj.afterSuccess=function(data){
            //log.debug(data);
            var obj=eval("("+data+")");
            if(obj.isError=="1"){
                $("#dialog-box").myLog("err","Saved Dashlet:"+obj.dashletId);
            }
            else{
                $("#dialog-box").myLog("msg","Saved Dashlet:"+obj.dashletId);
            }
            
        }
        
        aj.request(param);

    },
    initShareDashboardButton:function(bt_share){
        var oThis=this;
        var dheight="auto";
        if($.browser.msie){
            
            dheight="450px";
            
        }


        $(bt_share).click(function(){

            
            $("#dd_share_with").attr("selectedIndex",0);

            $(".ui-share-dashboard").dialog({
                modal:true,
                resizable:false,
                width:500,
                height:dheight,
                buttons:{
                    
                    "Submit":function(){

                        var dialogThis=this;

                        var shareWith=$("#dd_share_with").val();
                        var shareWithType=$("#dd_share_type").val();
                       
                        var shareWithValues=$("#dd_shareWith_col").val();
                        shareWithValues=shareWithValues+"";
                        var vals=shareWithValues.split(",");
                        if(vals[0]!="null"){
                            if(shareWith=="profile"){
                            
                                for(var i=0;i<vals.length;i++){
                                    var aj= new CH.Ajax();
                                    var param={
                                        type:"shareWithProfile",
                                        dashboardId:CH.Dashboard.dashboardId,
                                        profileId:vals[i],
                                        shareType:shareWithType
                                    };

                                    aj.afterSuccess=function(data){
                                        //log.debug(data);
                                        var obj=eval("("+data+")");
                                        if(obj.isError=="0"){
                                            
                                            $("#dialog-box").myLog("msg","Dashboard Shared");
                                        }
                                        else{
                                            $("#dialog-box").myLog("err","Is already Shared");
                                        }
                                    }
                                    $("#dialog-box").myLog("show");
                                    $("#dialog-box").myLog("clear");
                                    $("#dialog-box").myLog("setTitle","Saved");
                                    aj.request(param);
                                }
                            
                            }
                            else if(shareWith=="people"){
                                for(var i=0;i<vals.length;i++){
                                    var aj= new CH.Ajax();
                                    var param={
                                        type:"shareWithPerson",
                                        dashboardId:CH.Dashboard.dashboardId,
                                        personId:vals[i],
                                        shareType:shareWithType
                                    };

                                    aj.afterSuccess=function(data){
                                        var obj=eval("("+data+")");
                                        if(obj.isError=="0"){

                                            $("#dialog-box").myLog("msg","Dashboard Shared");
                                        }
                                        else{
                                            $("#dialog-box").myLog("err","Is already Shared");
                                        }
                                    }
                                    $("#dialog-box").myLog("show");
                                    $("#dialog-box").myLog("clear");
                                    $("#dialog-box").myLog("setTitle","Saved");
                                    aj.request(param);
                                }
                            }
                            $(dialogThis).dialog( "close" );
                        }

                    },
                    "Cancel":function(){
                        $( this ).dialog( "close" );
                    }
                }
            });
            
            oThis.shareGetProfiles();
            
            oThis.drawUnShare();
        });


        $("#dd_share_with").change(function(){
            var temp=$(this).val();
            if(temp=="profile"){
                oThis.shareGetProfiles();
            }
            else if(temp=="people"){
                oThis.shareGetPeople();
            }
        });
        
    },
    drawUnShare:function(){
        var oThis=this;
        /**For unsharing**/
        var aj= new CH.Ajax();
        var param={
            type:"getSharedWith",
            dashboardId:oThis.dashboardId
        };

        aj.afterSuccess=function(data){
            //log.debug(data);

            var obj=eval("("+data+")");

            var person=obj[0].person;
            var profile=obj[1].profile;

            $(".ui-unshare-list").html("<div>"+CH.lang.users+"</div>");
            for(var i=0;i<person.length;i++){
                $(".ui-unshare-list").append("<li>"+person[i].firstName+"<span>"+person[i].id+"</span><div class='unshare-button-person' style='font-size:10px;height:18px;'>remove</div></li>");
            }
            $(".unshare-button-person").button();
            $(".unshare-button-person").click(function(){
                var personId=$(this).siblings("span").html();

                var pNode=$(this).parent("li");

                var aj=new CH.Ajax();
                var param={
                    type:"removePersonSharing",
                    dashboardId:oThis.dashboardId,
                    personId:personId
                }
                aj.afterSuccess=function(data){
                    var obj= eval("("+data+")");
                    if(obj.isError=="0"){
                        $(pNode).fadeOut(500,function(){
                            $(pNode).remove();
                        });
                    }
                    
                }
                aj.request(param);




            });


            $(".ui-unshare-list").append("<bt/>");


            $(".ui-unshare-list").append("<div>"+CH.lang.profiles+"</div>");
            for(var i=0;i<profile.length;i++){
                $(".ui-unshare-list").append("<li>"+profile[i].title+"<span>"+profile[i].id+"</span><div class='unshare-button-profile' style='font-size:10px;height:18px;'>remove</div></li>");
            }
            $(".unshare-button-profile").button();
            $(".unshare-button-profile").click(function(){
                var profileId=$(this).siblings("span").html();
                var pNode=$(this).parent("li");

                var aj=new CH.Ajax();
                var param={
                    type:"removeProfileSharing",
                    dashboardId:oThis.dashboardId,
                    profileId:profileId
                }
                aj.afterSuccess=function(data){
                    log.debug(data);
                    var obj= eval("("+data+")");
                    if(obj.isError=="0"){
                        $(pNode).fadeOut(500,function(){
                            $(pNode).remove();
                        });
                    }
                }
                aj.request(param);


            });


        }

        aj.request(param);
    },
    shareGetPeople:function(){
        var aj=new CH.Ajax();
        var param={
            type:"getPeople"
        }

        aj.afterSuccess=function(data){
            
            $("#ui-share-form-content").html("<select id='dd_shareWith_col' class='multiselect' multiple='multiple'></select>");
            var people=eval("("+data+")");
            for(var i=0;i<people.length;i++){
                $("#dd_shareWith_col").append("<option value='"+people[i].personId+"'>"+people[i].personFname+"</option>");
            }
            
            $("#dd_shareWith_col").multiselect();
            CH.Loader.hide();
        }
        CH.Loader.show();
        aj.request(param);

    },
    shareGetProfiles:function(){
        var aj=new CH.Ajax();
        var param={
            type:"getProfiles"
        }

        aj.afterSuccess=function(data){
           
            $("#ui-share-form-content").html("<select id='dd_shareWith_col' class='multiselect' multiple='multiple'></select>");
            var prof=eval("("+data+")");
            for(var i=0;i<prof.length;i++){
                $("#dd_shareWith_col").append("<option value='"+prof[i].profileId+"' title='"+prof[i].desc+"'>"+prof[i].profile+"</option>");
            }

            $("#dd_shareWith_col").multiselect();
            CH.Loader.hide();
        }
        CH.Loader.show();
        aj.request(param);

    },
    initPublicDashboardButton:function(bt_public,p){
        CH.Dashboard.isPublic=p;
        if(CH.Dashboard.isPublic){
            $(bt_public).html(CH.lang.private1);
        }
        else{
            $(bt_public).html(CH.lang.public1);
        }

        $(bt_public).click(function(){
            
            if(!CH.Dashboard.isPublic){
                
                $(bt_public).html(CH.lang.public1);
                $("#ui-unpublic").prop("title",CH.lang.public1);
                $("#ui-unpublic p").html(CH.lang.makingPublic);
                $("#ui-unpublic").dialog({
                    resizable:false,
                    show:"slideDown",
                    hide:"fadeOut",
                    position:[$(bt_public).position().left,$(bt_public).position().top],
                    modal:true,
                    buttons:{
                        "Make Public":function(){
                            var dialThis=this;

                            var aj=new CH.Ajax();
                            var param={
                                type:"makeDashboardPublic",
                                dashboardId:CH.Dashboard.dashboardId,
                                isPublic:"1"
                            };

                            aj.afterSuccess=function(data){
                                
                                $(dialThis).dialog( "close" );

                                /*$(bt_public).fadeOut(500,function(){
                                    $(bt_public).remove();
                                });*/
                                CH.Dashboard.isPublic=true;
                                $(bt_public).html(CH.lang.private1);
                            }
                            aj.request(param);

                        },
                        "Cancel":function(){
                            $(this).dialog("close");
                        }
                    }
                });
            }
            else{
                $(bt_public).html(CH.lang.private1);
                $("#ui-public").prop("title",CH.lang.private1);
               
                $("#ui-public p").html(CH.lang.makingPrivate);
                $("#ui-public").dialog({
                    resizable:false,
                    show:"slideDown",
                    hide:"fadeOut",
                    position:[$(bt_public).position().left,$(bt_public).position().top],
                    modal:true,
                    buttons:{
                        "unPublic":function(){
                            var dialThis1=this;

                            var aj=new CH.Ajax();
                            var param={
                                type:"makeDashboardPublic",
                                dashboardId:CH.Dashboard.dashboardId,
                                isPublic:"0"
                            };

                            aj.afterSuccess=function(data){
                                log.debug(data);
                                $(dialThis1).dialog( "close" );

                                /*$(bt_public).fadeOut(500,function(){
                                        $(bt_public).remove();
                                    });*/
                                CH.Dashboard.isPublic=false;
                                $(bt_public).html(CH.lang.public1);
                            }
                            aj.request(param);

                        },
                        "Cancel":function(){
                            $(this).dialog("close");
                        }
                    }
                });
                
            }
        });
    },
    initUnpublicDashboardButton:function(bt_public){
        
        $(bt_public).click(function(){
            alert("yes this one");
            $("#ui-public p").html("want to make it private?");
            $("#ui-public").dialog({
                resizable:false,
                show:"slideDown",
                hide:"fadeOut",
                position:[$(bt_public).position().left,$(bt_public).position().top],
                modal:true,
                buttons:{
                    "unPublic":function(){
                        var dialThis=this;

                        var aj=new CH.Ajax();
                        var param={
                            type:"makeDashboardPublic",
                            dashboardId:CH.Dashboard.dashboardId,
                            isPublic:"0"
                        };

                        aj.afterSuccess=function(data){
                            log.debug(data);
                            $(dialThis).dialog( "close" );

                            $(bt_public).fadeOut(500,function(){
                                $(bt_public).remove();
                            });
                        }
                        aj.request(param);

                    },
                    "Cancel":function(){
                        $(this).dialog("close");
                    }
                }
            });
        });
    },
    initUnshareDashboardButton:function(bt_unshare){
        var oThis=this;

        $(bt_unshare).click(function(){

            

            $(".ui-unshare").dialog({
                resizable:false,
                modal:true,
                width:400,
                height:400,
                open:function(event,ui){
                    var aj= new CH.Ajax();
                    var param={
                        type:"getSharedWith",
                        dashboardId:oThis.dashboardId
                    };

                    aj.afterSuccess=function(data){
                        //log.debug(data);
                        
                        var obj=eval("("+data+")");

                        var person=obj[0].person;
                        var profile=obj[1].profile;

                        $(".ui-unshare-list").html("<div>People</div>");
                        for(var i=0;i<person.length;i++){
                            $(".ui-unshare-list").append("<li>"+person[i].firstName+"<span>"+person[i].id+"</span><div class='unshare-button-person' style='font-size:10px;height:18px;'>remove</div></li>");
                        }
                        $(".unshare-button-person").button();
                        $(".unshare-button-person").click(function(){
                            var personId=$(this).siblings("span").html();
                            
                            var pNode=$(this).parent("li");

                            var aj=new CH.Ajax();
                            var param={
                                type:"removePersonSharing",
                                dashboardId:oThis.dashboardId,
                                personId:personId
                            }
                            aj.afterSuccess=function(data){
                                log.debug(data);
                                $(pNode).fadeOut(500,function(){
                                    $(pNode).remove();
                                });
                            }
                            aj.request(param);
                          
                        });


                        $(".ui-unshare-list").append("<bt/>");

                        $(".ui-unshare-list").append("<div>Profiles</div>");
                        for(var i=0;i<profile.length;i++){
                            $(".ui-unshare-list").append("<li>"+profile[i].title+"<span>"+profile[i].id+"</span><div class='unshare-button-profile' style='font-size:10px;height:18px;'>remove</div></li>");
                        }
                        $(".unshare-button-profile").button();
                        $(".unshare-button-profile").click(function(){
                            var profileId=$(this).siblings("span").html();
                            var pNode=$(this).parent("li");

                            var aj=new CH.Ajax();
                            var param={
                                type:"removeProfileSharing",
                                dashboardId:oThis.dashboardId,
                                profileId:profileId
                            }
                            aj.afterSuccess=function(data){
                                log.debug(data);
                                $(pNode).fadeOut(500,function(){
                                    $(pNode).remove();
                                });
                            }
                            aj.request(param);

                        });

                    }

                    aj.request(param);

                },
                buttons:{
                    "Done":function(){
                        $(this).dialog("close");
                    }
                }
            });
        });
        
    },
    initGraphColorButton:function(bt_selector){

        //not used now

        var oThis=this;
        
        $(bt_selector).click(function(){
        
            $("#ui-graph-color").dialog({
                resizable:false,
                modal:true,
                width:600,
                buttons:{
                    "Done":function(){
                        oThis.reRenderGraphs();
                        $(this).dialog("close");
                    }
                },
                open:function(event,ui){
                    $("#ui-graph-color").html("<div><label for='dd_type'>Color for:</label><select name='dd_type' id='dd_colorType'><option value='-1'>--</option><option value='0'>Column</option><option value='1'>Values</option></select></div>");
                    $("#ui-graph-color").append("<div><label for='dd_que'>Query</label><select name='dd_que' id='dd_que' style='width:200px'></select></div>");
                    $("#ui-graph-color").append("<div id='columnDiv'></div>");
                    $("#ui-graph-color").append("<div id='valDiv'></div>");
                   
                    $("#ui-graph-color").append("<div id='colorSelector'><div style='background-color:#0000FF;'></div></div>");

                    $("#ui-graph-color").append("<button id='bt_color_submit'>add</button>");
                    $("#bt_color_submit").button();
                    $("#bt_color_submit").attr("disabled",true);
                    $("#ui-graph-color").append("<ul id='color_list'></ul>");

                    var colorRGB={
                        r:247,
                        b:15,
                        g:15
                    };

                    $('#colorSelector').ColorPicker({
                        flat: true,
                        onChange:function (hsb, hex, rgb) {

                            //log.debug(JSON.stringify(rgb));
                            colorRGB=rgb;
                        },
                        onSubmit:function(hsb,hex,rgb){
                            alert(JSON.stringify(rgb));
                        },
                        color: '#0000ff'
                        
                    });

                    $("#bt_color_submit").unbind('click');
                    $("#bt_color_submit").click(function(){
                        submitColor(colorRGB);
                    });

                    getColorList("#ui-graph-color "+"#color_list");

                    
                    $("#ui-graph-color #dd_colorType").change(function(){
                        $("#ui-graph-color #valDiv").html("");
                        $("#columnDiv").html("");
                        $("#bt_color_submit").attr("disabled",true);

                        if($("#ui-graph-color #dd_colorType").val()!="-1"){
                             
                            var aj=new CH.Ajax();
                            var param={
                                type:"getQueries"
                            };
                            aj.afterSuccess=function(data){
                                $("#loader").remove();
                                var obj=eval("("+data+")");
                                for(var i=0;i<obj.length;i++){
                                    $("#ui-graph-color #dd_que").append("<option value='"+obj[i].id+"'>"+obj[i].name+"</option>");
                                }
                                if($("#ui-graph-color #dd_colorType").val()=="0"){
                                    $("#columnDiv").html("<label for='dd_cols'>Column</label><select id='dd_cols'></select>");
                                    getColumns($("#ui-graph-color #dd_que").val());
                                }
                                else if($("#ui-graph-color #dd_colorType").val()=="1"){
                                    $("#columnDiv").html("");
                                    getValeurs($("#ui-graph-color #dd_que").val());
                                }

                            }

                            $("#ui-graph-color").append("<img src='./img/loader.gif' id='loader'>");
                            aj.request(param);
                        }
                    });
                    $("#ui-graph-color #dd_que").change(function(){
                        $("#bt_color_submit").attr("disabled",true);
                        $("#ui-graph-color #valDiv").html("");
                        if($("#ui-graph-color #dd_colorType").val()=="0"){
                            $("#columnDiv").html("<label for='dd_cols'>Column</label><select id='dd_cols'></select>");
                            getColumns($("#ui-graph-color #dd_que").val());
                        }
                        else if($("#ui-graph-color #dd_colorType").val()=="1"){
                            $("#columnDiv").html("");
                            getValeurs($("#ui-graph-color #dd_que").val());
                        }
                    });
                    
                    $("#ui-graph-color #dd_que").change();

                }
            });
            
        });

        //helper func

       
        function getValeurs(requeteId){
            
            var aj=new CH.Ajax();
            var param={
                type:"getValeurs",
                requeteId:requeteId
            };

            aj.afterSuccess=function(data){
                //log.err(data);
                
                $("#valDiv").html(data);

                $("#valDiv #dd_valuer").unbind('change');
                $("#valDiv").append("<div id='valuesDiv'><div>");
                $("#valDiv #dd_valuer").change(function(){
                    $("#valDiv #valuesDiv").html();
                    $.ajax({
                        url:"./liste_valeur.jsp",
                        type:"POST",
                        cache:false,
                        data:{
                            d:'a',
                            g:0,
                            id:$("#ui-graph-color #valDiv .cacheId").text(),
                            champ:$("#dd_valuer").val(),
                            fromGraphColor:0
                        },
                        success:function(data){
                            $("#ui-graph-color #valDiv #valuesDiv").html(data);
                            $("#bt_color_submit").attr("disabled",false);  
                        }
                    });



                });
                $("#ui-graph-color #valDiv #dd_valuer").change();
                 
                 
            }
            
            aj.request(param);
            
        }

        function submitColor(colorRGB){

            var col;
            
            var param={};

            var bool=true;
            
            
            if($("#dd_colorType").val()=="0"){
                param.nameType="0";
                param.name=$("#dd_cols").val();
                col=$("#dd_cols").val();
            }
            else if($("#dd_colorType").val()=="1"){
                
                if(($("#dd_values").val()!="")||($("#dd_values").val()!="undefined")){
                    param.nameType="1";
                    param.name=$("#dd_values").val();
                    col=$("#dd_values").val();
                }
            }
            else{
                bool=false;
            }
            param.dashboardId=CH.Dashboard.dashboardId;
            param.color=colorRGB.r+","+colorRGB.g+","+colorRGB.b;
            param.type="addGraphColor";

            

            var aj=new CH.Ajax();
            aj.afterSuccess=function(data){
                data=$.trim(data);
                if(data!="-1"){
                    $("#color_list").prepend("<li style='list-style:none;' id='"+col+"' title='Click to remove'><span style='float:left;'>"+col+ "</span><div style='width:15px;height:15px;background-color:rgb("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+");float:right'></div><div style='clear:both;'></div></li>");
                    var temp = document.getElementById(col);
                    $(temp).click(function(){
                        var id=$(this).attr("id");
                        removeColor(id);
                    });
                }
                else{
                    log.err("failed insertion");
                }
            }
            if(bool){
                aj.request(param);
            }
            

        }

        function getColorList(selector){
            /*fetching columsn already assigned color */

            var aj2=new CH.Ajax();
            aj2.afterSuccess=function(data){

                var obj=eval("("+data+")");

                
                
                for(var i=0;i<obj.length;i++){
                    var col=obj[i].columnName;
                    $(selector).prepend("<li style='list-style:none;' id='"+col+"' title='Click to remove'><span style='float:left;'>"+col+ "</span><div style='width:15px;height:15px;background-color:rgb("+obj[i].color+");float:right'></div><div style='clear:both;'></div></li>");
                    var temp = document.getElementById(col);

                    $(temp).click(function(){
                        var id=$(this).attr("id");
                        removeColor(id);
                    });

                }

            }

            var param2={
                type:"getGraphColors",
                dashboardId:CH.Dashboard.dashboardId
            }

            aj2.request(param2);
        /*****************/
        }

        function removeColor(id){
            //var temp = document.getElementById(id);
            
            var aj= new CH.Ajax();
            aj.afterSuccess=function(data){
                data=$.trim(data);
                if(data!="-1"){
                    $("#"+id).fadeOut(100,function(){
                        $("#"+id).remove();
                    });
                }
                else{
                    log.err("error removing");
                }
            }

            var param={
                type:"removeGraphColor",
                dashboardId:CH.Dashboard.dashboardId,
                columnName:id
            }

            aj.request(param);
        }

        function getColumns(requeteId){
            $("#ui-graph-color").append("<img src='./img/loader.gif' id='loader'>");
            var aj= new CH.Ajax();
            var param={
                type:"getColumns",
                requeteId:requeteId
            }
            aj.afterSuccess=function(data){

                $("#ui-graph-color #dd_cols").html("");
                $("#loader").remove();
                var obj=eval("("+data+")");

                obj=(obj[0].name).split(",");
                for(var i=0;i<obj.length;i++){
                    if(obj[i]!=""){
                        $("#ui-graph-color #dd_cols").append("<option value='"+obj[i]+"'>"+obj[i]+"</option>");
                    }
                }
                $("#bt_color_submit").attr("disabled",false);                
            }
            aj.request(param);

        }

        function getColValues(selector,colName){
            
            var aj=new CH.Ajax();
            var param={
                type:"getColValue",
                requeteId:$("#ui-graph-color #dd_que").val(),
                colName:colName
            };
            aj.afterSuccess=function(data){
                $(selector).html(data);
            }
            aj.request(param);
        }

    },
    initDateFilterButton:function(bt_selector){
        var oThis=this;
        $(bt_selector).click(function(){
            
            $(".ui-date-filter").prop("title",CH.lang.filter);
            $(".ui-date-filter span p").html(CH.lang.applyFilter);
            $(".ui-date-filter").dialog({
                width:400,
                height:400,
                resizable:false,
                modal:true,
                buttons:{
                    "Ok":function(){
                        var dash=oThis.dashlets;
                        for(var i=0;i<dash.length;i++){
                            if(dash[i].dashType=="JFreeChart"){
                                dash[i].render2("#content_"+dash[i].dashId);
                            }
                        }
                        $(this).dialog("close");
                    },
                    "Cancel":function(){
                        $(this).dialog("close");
                    }
                }
            });

            $.datepicker.setDefaults( $.datepicker.regional["fr"] );

            $("#inp_toDate").datepicker({
                showButtonPanel: true,
                dateFormat: 'dd/mm/yy',
                changeMonth: true,
                changeYear: true,
                showOn:"button",
                buttonImage: "./img/calendar.gif",
                buttonImageOnly: true,
                buttonText:"Choose"
            });
            $("#inp_fromDate").datepicker({
                showButtonPanel: true,
                dateFormat: 'dd/mm/yy',
                changeMonth: true,
                changeYear: true,
                showOn:"button",
                buttonImage: "./img/calendar.gif",
                buttonImageOnly: true,
                buttonText:"Choose"
            });

        });
    },
    reRenderGraphs:function(){
        var dash=this.dashlets;
        for(var i=0;i<dash.length;i++){

            if(dash[i].dashType=="JFreeChart"){
                dash[i].render("#content_"+dash[i].dashId);
            }
        }
    },
    initSetUserHomePage:function(selector){
        var oThis=this;
        var width="auto";
        var height="auto";
        if($.browser.msie){
            width=400;
            height=400;
        }
        $(selector).click(function(){
            $(".ui-user-homepage").dialog({
                modal:true,
                resizable:false,
                width:width,
                height:height,
                create:function(event,ui){
                    $(".ui-user-homepage").append("<div style='float:clear;'></div><div id='proHome'></div>");
                },
                open:function(event,ui){


                    var aj=new CH.Ajax();
                    var param={
                        type:"getHomePage",
                        personId:oThis.personId
                    }

                    aj.afterSuccess=function(data){
                        log.debug(data);
                        data=$.trim(data);
                        $("#homeUrl").text(data);
                    };

                    aj.request(param);

                    
                },
                buttons:{
                    "Update":function(){
                        var val=$("input[name=urls]:checked").val();

                        var aj=new CH.Ajax();

                        var param={
                            type:"setUserHome",
                            personId:oThis.personId
                        }

                        if(val==0){
                            param.url="";
                        }
                        else{
                            param.url="chart/my_dashboard2.jsp?dashID="+oThis.dashboardId;
                        }

                        aj.afterSuccess=function(data){
                            log.debug(data);
                            if(val==0){
                                $("#homeUrl").text("Default");
                            }
                            else{
                                $("#homeUrl").text(param.url);
                            }
                        }
                        aj.request(param);
                        
                    },
                    "Done":function(){
                        $(this).dialog("close");
                    }
                }
            }); 
        });
    },
    initSetProfileHomePage:function(selector){
        
        var oThis=this;
        var aj2=new CH.Ajax();
        var param={
            type:"inAdminProfile",
            personId:oThis.personId
        };
        
        aj2.afterSuccess=function(data){

            //log.err(data);
            var width="auto";
            var height="auto";
            if($.browser.msie){
                width=400;
                height=400;
            }
            
            var pdata=eval("("+data+")");
            var profils;
            if(pdata.isAdmin=="1"){
                
                $(selector).click(function(){
                    $(".ui-profile-homePage").dialog("destroy");
                    $(".ui-profile-homePage").dialog({
                        resizable:false,
                        modal:true,
                        width:width,
                        height:height,
                        open:function(ev,ui){
                            $("#profileUrl").text(pdata.url);

                            var aj=new CH.Ajax();
                            var param={
                                type:"getProfiles"
                            };
                            aj.afterSuccess=function(data){
                                profils=eval("("+data+")");
                                //log.err(data);
                                $("#dd_profile").html("");
                                for(var i=0;i<profils.length;i++){
                                    var htm="<option value='"+profils[i].profileId+"'>"+profils[i].profile+"</option>";
                                    $("#dd_profile").append(htm);
                                }
                                $("#dd_profile").change();
                                $("#dd_profile").change(function(){
                                    var ind=$("#dd_profile").attr("selectedIndex");
                                    if(ind>=0){
                                        if(profils[ind].home=="" || profils[ind].home==" "){
                                            $("#profileUrl").html("Default");
                                        }
                                        else{
                                            $("#profileUrl").html(profils[ind].home);
                                        }
                                    }
                                });
                                
                            }
                            aj.request(param);

                        },
                        buttons:{
                            "update":function(){
                                var ind=$("#dd_profile").attr("selectedIndex");
                                var val=$("input[name=purls]:checked").val();

                                var aj=new CH.Ajax();
                                var param={
                                    type:"setProfileHome",
                                    profileId:$("#dd_profile").val()
                                };

                                if(val==0){
                                    param.url="";
                                }
                                else{
                                    param.url="chart/my_dashboard2.jsp?dashID="+oThis.dashboardId;
                                }

                                
                                aj.afterSuccess=function(data){
                                    log.debug(data);
                                    var obj=eval("("+data+")");
                                    if(obj.updated>=1){
                                        profils[ind].home=param.url;

                                        if(profils[ind].home=="" || profils[ind].home==" "){
                                            $("#profileUrl").html("Default");
                                        }
                                        else{
                                            $("#profileUrl").html(profils[ind].home);
                                        }

                                    }
                                }

                                aj.request(param);

                                
                            },
                            "Done":function(){
                                $(this).dialog("close");
                            }
                         
                        }
                    });
                });
            }
            else{
                $(selector).click(function(){
                    alert("For Admins only");
                });
            }


        };

        aj2.request(param);
        
    },
    initViewTypeButton:function(selector){
        var oThis=this;
        $(selector).buttonset();
        $(selector).css("font-size","12px");
        /*if(oThis.viewType=="0"){
            $(selector+" #fluid").attr("checked","checked");
            $(selector).button("refresh");
        }
        else if(oThis.viewType=="1"){
            $(selector+" #fixed").attr("checked","checked");
            $(selector).button("refresh"); 
        }*/
        
        oThis.setViewTypeNone();
        
        var aj=new CH.Ajax();
        aj.afterSuccess=function(data){
        //            alert(data);
        };
        var params={
            type:"updateViewType",
            dashboardId:oThis.dashboardId,
            viewType:"0"
        };
        
        $("input[name='viewType']").change(function(){
            
            var type=$(this).val();
            
            if(type=="fluid"){
                oThis.viewType=0;
                params.viewType=0;
            }
            else if(type=="fixed"){
                oThis.viewType=1;
                params.viewType=1;
            }
            else if(type=="none"){
                oThis.viewType=2;
                params.viewType=2;
            }
            
            oThis.setViewTypeNone();
            aj.request(params);
            
        });

    },
    setViewTypeNone:function(){
        if(this.viewType=="2"){
            $("#myGrid").css("width","1024px");
            $("#myGrid").css("overflow","auto");
        }else{
            $("#myGrid").css("width","");
            $("#myGrid").css("overflow","");
        }  
    },
    sumHorizontalWidth:function(){
        var sumWidth=0;
        var cols=$(".column");
        if(cols){
            if(cols.length==1){
                sumWidth=$(cols).width();
            }
            else{
                var firstColPosition=$(cols[0]).position();
                sumWidth=$(cols[0]).outerWidth();
                
                for(var i=1;i<cols.length;i++){
                   
                    var pos= $(cols[i]).position();
                    if(firstColPosition.top==pos.top){
                        sumWidth+=$(cols[i]).outerWidth();
                    }
                    else{
                        break;
                    }
                    
                }
            }
        }
        return sumWidth;
    },
    initWindowResize:function(){
        var oThis=this;
        
        var fl_isStart=false;
        this.windowWidth=$(window).width();
        this.windowHeight=$(window).height();
        
        oThis.sumWidth=this.sumHorizontalWidth();
        
        $(window).resize(function(e){
            if(oThis.viewType==1){
                
                if($.browser.msie){ 
                    /**For IE**/
                    //var target = (window.event) ? window.event.srcElement /* for IE */ : e.target
                    if(e.target.parentNode==null){
                        if(this.resizeTO) clearTimeout(this.resizeTO);
                        this.resizeTO = setTimeout(function() {
                            $(this).trigger('resizeEndWindow');
                        }, 500);
                    }
                    
                }
                if(e.target==window){
                    if(this.resizeTO) clearTimeout(this.resizeTO);
                    this.resizeTO = setTimeout(function() {
                        $(this).trigger('resizeEndWindow');
                    }, 500);
                }
            }
        });

        $(window).bind('resizeEndWindow', function(e){
            var width=$(window).width(); 
            var height=$(window).height();
            var sumWidth=oThis.sumWidth; 
            
            if((width<sumWidth-5) ){
                
                oThis.fl_windowDecreased=true;
                for(var i=0;i<oThis.dashlets.length;i++){
                    var obj=oThis.dashlets[i].onWindowResize(width,height);
                    
                } 
            }
            else if(oThis.fl_windowDecreased){
                
                for(var i=0;i<oThis.dashlets.length;i++){ 
                    var obj=oThis.dashlets[i].onWindowResize(width,height); 
                }    
                oThis.fl_windowDecreased=false;
            }
        });
    },
    
    
    /**for filter column functionalities**/
    initColumnFilterButton:function(select){
        
        var oThis=this;
        $(select).click(function(){
            var width="600";
            var height="400";
            /* if($.browser.msie){
                height="600 px";
                width="800 px";
            //chepi for ie
                
            }*/
            
            $(".valFilterDialog").dialog({
                resizable:true,
                modal:true,
                width:width,
                height:height,
                title:"Filter for column",
                buttons:{
                    "Apply":function(){
                        //alert($(".valFilterDialog .dd_colFilterValue").val());
                        var values=$(".valFilterDialog .dd_colFilterValue").val()+"";
                        values=$.trim(values);  
                        var colName=$(".valFilterDialog .dd_colFilter").val();
                        if(values.length>0 && values!="null" && colName!="--"){
                            for(var i=0;i<CH.Dashboard.dashlets.length;i++){
                                CH.Dashboard.dashlets[i].renderWithFilter(colName,values);
                            }
                            $(this).dialog("close");
                        }
                        else{
                            $("#dialog-box").myLog("clear");
                            $("#dialog-box").myLog("setAutoHide",true);
                            $("#dialog-box").myLog("show");
                            $("#dialog-box").myLog("err","Please Select a value");
                            $("#dialog-box").myLog("centerAlign");
                        }
                        
                    },
                    "cancel":function(){
                        $(this).dialog("close"); 
                    }
                },
                create:function(){
                    //oThis.initContextColumns(".valFilterDialog .dd_colFilter");
                    var graphIds="";
                    for(var i=0;i<CH.Dashboard.dashlets.length;i++){
                        if(CH.Dashboard.dashlets[i].dashType=="JFreeChart"){
                            var dat=eval("("+CH.Dashboard.dashlets[i].dashData+")");
                            graphIds+=dat.graphId+",";
                        }
                    }
                    if(graphIds.length>1){
                        graphIds=graphIds.substring(0,graphIds.length-1);
                    //                        alert(graphIds);
                    }
                    //alert(graphIds);
                    
                    var aj= new CH.Ajax();
                    aj.afterSuccess=function(data){
                        data=$.trim(data);
                        var cols=data.substring(0,data.indexOf("-^_^-"));
                        var cacheIds=data.substring(data.indexOf("-^_^-")+5,data.length);
                        //alert(cols+"---"+cacheIds);
                        $(".valFilterDialog .dd_colFilter").html(cols);
                        $(".valFilterDialog .dd_colFilter").data('cacheIds',cacheIds); //binding
                        
                        $(".valFilterDialog .dd_colFilter").change(CH.Dashboard.getColFilterValues);
                        if(!$.browser.msie){
                            $(".valFilterDialog .dd_colFilterValue").multiselect();
                        }
                    };
                    var params={
                        type:"getCachedColumnsInGraphs",
                        graphIds:graphIds 
                    }
                    aj.request(params);
                    
                }
            });
            
        });
    },
    getColFilterValues:function(){
        var colName=$(".valFilterDialog .dd_colFilter").val();
        if(colName!="--"){
           
            $(".valFilterDialog .dd_colFilter").data("cacheIds");
           
            var params={
                type:"getColFilterValues",
                colName:colName,
                cacheIds: $(".valFilterDialog .dd_colFilter").data("cacheIds")
            };
           
            var aj= new CH.Ajax();
            aj.afterSuccess=function(data){
                $(".valFilterDialog .dd_colFilterValue").multiselect("destroy");
                $(".valFilterDialog .dd_colFilterValue").html(data);
                $(".valFilterDialog .dd_colFilterValue").multiselect();
            };
            aj.request(params);
        }
    },
    filterContextHash:[],
    initContextColumns:function (select)
    {
        var oThis=this;
        var dbtable,nom_table_ihm,contextServer,contextDb,contextTable;
        //var html=$("#tContext").html()+' : <select id="contextColumnsCombo" name="contextColumnsCombo"  style="width: 145px; overflow: auto" onchange="initTree();">';
        var html="";//"<option value='--'>--</option>";
        var contextColumnsArray=this.contextColumns.split('|');
        for(var i=0;i<contextColumnsArray.length;i++) 
        {
            contextColumnsArray[i]=contextColumnsArray[i].split(',');
        }
        for(i=0;i<contextColumnsArray.length-1;i++)
        {
            dbtable=contextColumnsArray[i][0];
            nom_table_ihm=contextColumnsArray[i][1];
            contextServer=contextColumnsArray[i][2];
            contextDb=contextColumnsArray[i][3];
            contextTable=contextColumnsArray[i][4];
            this.filterContextHash[dbtable]={
                server: contextServer,
                db: contextDb,
                table: contextTable
            };
            
            html+='<option value="'+dbtable+'" title="'+nom_table_ihm+'">'+nom_table_ihm+'</option>';
            
        }
        $(select).html(html);
        //deployContext(context);
        if(!$.browser.msie){
            $(".valFilterDialog .dd_colFilterValue").multiselect();
        }
         
        oThis.initFilterTree($(select).val());
        $(select).change(function(){
            oThis.initFilterTree($(this).val());
        });
    
    },
    initFilterTree:function(context){
        var oThis=this;
        var i=0;
        var nodeType="none";
        var server="";
        var db="none";
        var table="none";
        var hierarchical="0";
        var tree=$(".valFilterDialog .tree").jstree({
            "themes" : {
                "theme" : "default"
            },
            "plugins" : [ "themes", "json_data", /*"search",*/ "ui", /*"contextmenu",*/ "sort"],
            /*"search" : {
                case_insensitive : true,
                show_only_matches : true,
                search_method : "jstree_title_contains"
            },*/
            "sort" : function (a, b) {
                return this.get_text(a).toUpperCase() > this.get_text(b).toUpperCase() ? 1 : -1;
            },
            //            "contextmenu" : {
            //                select_node : false,
            //                "items" : oThis.treeContextMenu
            //            },
            "json_data" : {
                "ajax" : {
                    "url" : "../admin/treeAjax/ajax.jsp?",
                    "data" : function (n) {
                        /*for(property in n)
                                        {
                                            //alert(property);
                                        }*/
                        if(n!=-1)
                        {
                            var node = $.data(n[0], "jstree");
                            nodeType=node.type;
                            server=node.server;
                            db=node.db;
                            table=node.table;
                            hierarchical=node.hierarchical;

                        }
                        //i++;

                        return {
                            "operation" : "getChildren",
                            "id" : n.attr ? n.attr("id").replace("node_","") : 1,
                            "type" : nodeType,
                            "server" : server,
                            "db" : db,
                            "table" : table,
                            "hierarchical" : hierarchical,
                            "rand" : Math.random(),
                            "context" : context
                        };
                    },
                    "success": function(data){
                    }
                }
            }
        });
        
        tree.bind('select_node.jstree', function (event, data) {
            var selectedNode = $.data(data.rslt.obj[0], "jstree");
            $.jstree._focused().open_node(data.rslt.obj[0],false);
            if((selectedNode.type=='champ' || selectedNode.type=='kpi')){
                CH.Loader.show();
                CH.Dashboard.filterSelectedColumn=selectedNode.name;
                var aj=new CH.Ajax();
                
                var params={
                    type:"getColFilterValues",
                    valeurs:selectedNode.name,
                    context:$(".valFilterDialog .dd_colFilter").val(),
                    filter:"",
                    groupByRow:"",
                    groupByColumn:"",
                    orderBy:"",
                    having:"",
                    limit:" limit 250 ",
                    valbdd:selectedNode.valbdd
                    
                };
                aj.afterSuccess=function(data){
                    data=$.trim(data);
                    $(".valFilterDialog .dd_colFilterValue").multiselect("destroy");
                    $(".valFilterDialog .dd_colFilterValue").html(data);
                    $(".valFilterDialog .dd_colFilterValue").multiselect();
                    CH.Loader.hide();
                    
                };
                
                aj.onError=function(xhr,textStatus,errorThrown){
                    CH.Loader.hide();
                    window.console.log("error:"+errorThrown+","+textStatus);
                }
                
                aj.request(params);
                
            }else{
                $(".valFilterDialog .dd_colFilterValue").html("");
            //$(".valFilterDialog .dd_colFilterValue").multiselect("destroy");
            }
        //setTimeout("if(isDoubleClick==false&&(selectedNode.type=='champ' || selectedNode.type=='kpi')){getInValuesOnClick(selectedNode);}",1000);
        });

      
    },
    filterSelectedColumn:""
    
/** END of filter column functionalities**/
    
}