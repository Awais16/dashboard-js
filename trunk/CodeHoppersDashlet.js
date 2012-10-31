if(window.CH == undefined){
    window.CH = {};
}
CH.Dashlet=function(){}; 
CH.Dashlet.prototype.dashId="";
CH.Dashlet.prototype.dashName="";
CH.Dashlet.prototype.dashWidth="";
CH.Dashlet.prototype.dashHeight="";
CH.Dashlet.prototype.dashOrder="";
CH.Dashlet.prototype.dashShared="";
CH.Dashlet.prototype.dashData="";
CH.Dashlet.prototype.dashColId="";
CH.Dashlet.prototype.dashColOrder="";
CH.Dashlet.prototype.dashboardId="";
CH.Dashlet.prototype.ownerDashboard="";

CH.Dashlet.prototype.render=function(contentDiv){
    alert("Default Rendered Function of Dashlet");
};

CH.Dashlet.prototype.draw=function(mainDiv){
    
    var col=$(mainDiv).children("#col_"+this.dashColId);
    if($(col).length<1){
        $(mainDiv).append("<div id='col_"+this.dashColId+"' class='column'></div>");
    }
    
    $("#col_"+this.dashColId).append("<div class='portlet' id='dash_"+this.dashId+"'> <div class='portlet-header'><div class='title'>"+this.dashName+"</div></div><div class='portlet-content' id='content_"+this.dashId+"'></div></div>");
    
    this.addClasses();

    $("#dash_"+this.dashId).width(this.dashWidth);
    $("#dash_"+this.dashId).height(this.dashHeight);

    this.appendRemoveOption();

    this.appendMaximizeOption();

    if(this.dashShared=="0"){
        this.appendShareOption();
    }

    this.appendEditOption();

    //this.appendOtherGraphOption();
    
    this.appendRefreshOption();

    if(this.dashType=="JFreeChart"){
        this.appendCreviewOption();
    }
    
    this.appendPlusOption();
    
    CH.makeHoverButton();

};

CH.Dashlet.prototype.appendPlusOption=function(){
    
    };

CH.Dashlet.prototype.appendRemoveOption=function(){

    var dheight="auto";
    if($.browser.msie){
        dheight=200;
    }
    
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-remove'><span class='ui-icon ui-icon-closethick' title='"+CH.lang.remove+" Dashlet'></span></div>");
        
        $("#dash_"+this.dashId+" .portlet-header .ui-bar-remove").click(function(){

            if((oThis.dashShared == "1") && (oThis.dashboardId == oThis.ownerDashboard)){

                $("#removeWarn span").html(CH.lang.qRemoveShare);
                $("#removeWarn").prop("title",CH.lang.removeShare);

                $("#removeWarn").dialog({
                    resizable:false,
                    modal:true,
                    height:dheight,
                    buttons:{
                        "Remove":function(){
                            var aj=new CH.Ajax();
                            aj.afterSuccess=function(data){
                                
                                var indx=CH.Dashboard.findIndex(oThis.dashId);
                                CH.Dashboard.removeDashlet(indx);

                                $("#dash_"+oThis.dashId).fadeOut(200,function(){
                                    $("#dash_"+oThis.dashId).remove();
                                    CH.Dashboard.adjustColWidth("#col_"+oThis.dashColId);
                                });
                                $("#removeWarn").dialog("close");
                            };
                            var params={
                                type:"removeSharedDashlet",
                                dashId:oThis.dashId
                            };
                            aj.request(params);
                            
                        },
                        "Cancel":function(){
                            $(this).dialog("close");
                        }
                    }
                });

            }
            else if((oThis.dashShared == "0") && (oThis.dashboardId == oThis.ownerDashboard)){

                $("#removeWarn2 span").html(CH.lang.qRemove);
                $("#removeWarn2").prop("title",CH.lang.remove);
                $("#removeWarn2").dialog({
                    resizable:false,
                    modal:true,
                    height:dheight,
                    buttons:{
                        "Remove":function(){
                            var aj=new CH.Ajax();
                            aj.afterSuccess=function(data){

                                var indx=CH.Dashboard.findIndex(oThis.dashId);
                                CH.Dashboard.removeDashlet(indx);

                                $("#dash_"+oThis.dashId).fadeOut(200,function(){
                                    $("#dash_"+oThis.dashId).remove();
                                    CH.Dashboard.adjustColWidth("#col_"+oThis.dashColId);
                                });
                            };
                            var params={
                                type:"removeSharedDashlet",
                                dashId:oThis.dashId
                            };
                            aj.request(params);
                            $("#removeWarn2").dialog("close");

                        },
                        "Cancel":function(){
                            $(this).dialog("close");
                        }
                    }
                });


            /**/

            }
            else{
                
                $("#removeWarn2 span").html(CH.lang.qRemove);
                $("#removeWarn2").prop("title",CH.lang.remove);
                
                $("#removeWarn2").dialog({
                    resizable:false,
                    modal:true,
                    height:dheight,
                    buttons:{
                        "Remove":function(){

                            var aj=new CH.Ajax();
                            aj.afterSuccess=function(data){

                                var indx=CH.Dashboard.findIndex(oThis.dashId);
                                CH.Dashboard.removeDashlet(indx);

                                $("#dash_"+oThis.dashId).fadeOut(200,function(){
                                    $("#dash_"+oThis.dashId).remove();
                                    CH.Dashboard.adjustColWidth("#col_"+oThis.dashColId);
                                });
                                
                            };
                            var params={
                                type:"removeDashlet",
                                dashId:oThis.dashId,
                                dashboardId:oThis.dashboardId
                            };
                            aj.request(params);
                            $("#removeWarn2").dialog("close");
                        },
                        "Cancel":function(){
                            $(this).dialog("close");
                        }
                    }
                });
            /***/
                
            }

        //$("#dash_"+this.dashId).css("cursor","busy");


        });
    }
    
};
/**gone to sub classes*/
CH.Dashlet.prototype.appendMaximizeOption=function(){
    /*
    var oThis=this;
   
    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-max'><span class='ui-icon ui-icon-newwin' title='Maximize Dashlet'></span></div>");
    



    $("#dash_"+this.dashId+" .portlet-header .ui-bar-max").click(function(){
            

        var cloneContent=$( "#dash_"+oThis.dashId+" .portlet-content").clone();
        $(cloneContent).attr("title",oThis.dashName);

        $(cloneContent).dialog({
            height:$(window).height() ,
            width:$(window).width(),
            modal: true,
            resizable:false,
            open:function(eve,ui){
                var temp=$(cloneContent).children("iframe").filter(":first");
                if(temp.length==1){

                    $(temp).attr("width",$(window).width()-CH.IFRAME_WIDTH_DIST-10);
                    $(temp).attr("height",$(window).height()-CH.IFRAME_HEIGHT_DIST-10);

                    $(temp).css("width",$(window).width()-CH.IFRAME_WIDTH_DIST-10);
                    $(temp).css("height",$(window).height()-CH.IFRAME_HEIGHT_DIST-10);

                }

                temp=$(cloneContent).children("#imgDiv");
                temp.attr("id","imgDiv2");
                temp=$("#imgDiv2 img");

                if(temp.length>0){
                    $(temp).attr("width",$(window).width()-CH.JFREEGRAPH_WIDTH_DIST-10);
                    $(temp).attr("height",$(window).height()-CH.JFREEGRAPH_HEIGHT_DIST-10);
                }
            }
        });
            
        
    });

     */
    };

CH.Dashlet.prototype.appendRefreshOption=function(){
    /*var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-refresh-cache'><span class='ui-icon ui-icon-refresh' title='Refresh Cache'></span></div>");
        
        var dat=eval("("+oThis.dashData+")");
        
        $("#dash_"+this.dashId+" .portlet-header .ui-bar-refresh-cache").click(function(){
            
            var aj=new CH.Ajax();
            var param={
                type:"refreshCache",
                graphId:dat.graphId
            }
            aj.afterSuccess=function(data){
                log.debug("new Cache Id"+data);
                oThis.render("#content_"+oThis.dashId);
            }
            aj.request(param);
            
        //alert("Refresh Cache (bugs pending)");

            log.debug("default refresh")
        });

    }
     */   
    };


CH.Dashlet.prototype.onWindowResize=function(width,height){
    
    
    var pWidth=(this.dashWidth/CH.Dashboard.windowWidth);
    var pHeight=(this.dashHeight/CH.Dashboard.windowHeight);
    
    var newWidth=pWidth*width;
    var newHeight=pHeight*height;
    
    var dashId="#dash_"+this.dashId;
    var imgJfree=$(dashId+" #imgDiv img");
    
    $(dashId).width(newWidth);
    $(dashId).height(newHeight);
   
   
    if(imgJfree.length>0){
        $(imgJfree).width((newWidth-CH.JFREEGRAPH_WIDTH_DIST));
        $(imgJfree).height((newHeight-CH.JFREEGRAPH_HEIGHT_DIST));               
    }
    
    CH.Dashboard.adjustColWidthNoAnim("#col_"+this.dashColId);
                   
    var tableau=$(dashId+" #tableau");
                    
    if(tableau.length>0){
        $(dashId+" .ifTable").width(width-CH.JFREEGRAPH_WIDTH_DIST);
        $(dashId+" .ifTable").height(height-CH.JFREEGRAPH_HEIGHT_DIST);
    }
    
    $(dashId+" iframe").width(newWidth-CH.JFREEGRAPH_WIDTH_DIST);
    $(dashId+" iframe").height(newHeight-CH.JFREEGRAPH_HEIGHT_DIST); 
    
    var ret={
        width:newWidth,
        height:newHeight
    };
    
    return ret;
}

/*****/

CH.Dashlet.prototype.appendCreviewOption=function(){
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-creview'><span class='ui-icon ui-icon-document' title='CreView'></span></div>");
        $("#dash_"+this.dashId+" .portlet-header .ui-bar-creview").click(function(){
            //alert("CreView: Under development");

            var url="../admin/flexgrid.jsp?requete_id="+$("#content_"+oThis.dashId+" #requete_id").text();
            window.open(url,"_blank");

        //alert($("#content_"+oThis.dashId+" #requete_id").text());
        });

    }
};

CH.Dashlet.prototype.appendShareOption=function(){
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-share'><span class='ui-icon ui-icon-transferthick-e-w' title='Share Dashlet'></span></div>");

        $("#dash_"+this.dashId+" .portlet-header .ui-bar-share").click(function(){
         
            var aj=new CH.Ajax();
            aj.afterSuccess=function(data){
                $("#dash_"+oThis.dashId+" .portlet-header .ui-bar-share").fadeOut(200);
                oThis.dashShared=1;

                $("#dialogWithText").prop("title","Notification");
                $("#dialogWithText").dialog({
                    resizable:false,
                    width:200,
                    hide:"fade",
                    open:function(eve,ui){
                        $(this).text("Dashlet is shared. Available to use in other dashboards");
                        setTimeout( function(){
                            $("#dialogWithText").dialog("close");
                        } , 2000);
                    }
                });

            };
            var params={
                type:"shareDashlet",
                dashId:oThis.dashId
            };
            aj.request(params);
        });
    }
    
};

CH.Dashlet.prototype.appendEditOption=function(){
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-edit'><span class='ui-icon ui-icon-pencil' title='Edit Dashlet'></span></div>");

        $("#dash_"+this.dashId+" .portlet-header .ui-bar-edit").click(function(){
            oThis.edit();
        });
    }
};

CH.Dashlet.prototype.addClasses=function(){

    $("#dash_"+this.dashId).addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
    .find( ".portlet-header" )
    .addClass( "ui-widget-header ui-corner-all")
    .end();

};

CH.Dashlet.prototype.save=function(){
    var oThis=this;

    var aj=new CH.Ajax();
    
    var param={
        type:"insertNewDashlet",
        dashName:oThis.dashName,
        dashType:oThis.dashType,
        dashWidth:oThis.dashWidth,
        dashHeight:oThis.dashHeight,
        dashOrder:oThis.dashOrder,
        dashShared:oThis.dashShared,
        dashData:oThis.dashData,
        dashColId:oThis.dashColId,
        dashColOrder:oThis.dashColOrder,
        dashboardId:oThis.dashboardId
    }

    aj.afterSuccess=function(data){

        
        var obj=eval("("+data+")");
        if(obj.isError=="0"){
            oThis.ownerDashboard=oThis.dashboardId;
            //alert("dashId="+obj.dashletId);
            oThis.dashId=obj.dashletId;
            CH.Dashboard.addDashlet(oThis);
            oThis.draw(CH.Dashboard.mainDiv);
            //CH.Dashboard.initResizable("#dash_"+oThis.dashId);
            CH.Dashboard.disableResizable(".portlet");
            CH.Dashboard.initResizable(".portlet");
            oThis.render("#content_"+oThis.dashId);
            CH.Loader.hide();
            $("#dialog-box").myLog("show");
            $("#dialog-box").myLog("clear");
            $("#dialog-box").myLog("setTitle","Saved");
            $("#dialog-box").myLog("setTimeToHide",1000);
            $("#dialog-box").myLog("setAutoHide",true);
            $("#dialog-box").myLog("msg","Dashlet added");
        }
        else{
            CH.Loader.hide();
            $("#dialog-box").myLog("show");
            $("#dialog-box").myLog("clear");
            $("#dialog-box").myLog("setTitle","Saved");
            $("#dialog-box").myLog("setTimeToHide",1000);
            $("#dialog-box").myLog("setAutoHide",true);
            $("#dialog-box").myLog("err","Dashlet not added");
        }

    }

    CH.Loader.show();
    aj.request(param);

};

CH.Dashlet.prototype.update=function(){
    var oThis=this;
    var aj=new CH.Ajax();

    var param={
        type:"updateDashlet",
        dashName:oThis.dashName,
        dashId:oThis.dashId,
        colId:oThis.dashColId,
        dashWidth:oThis.dashWidth,
        dashOrder:oThis.dashOrder,
        dashHeight:oThis.dashHeight,
        colOrder:oThis.dashColOrder,
        dashData:oThis.dashData,
        dashboardId:CH.Dashboard.dashboardId
    }

    aj.afterSuccess=function(data){
    //log.debug(data);
    }

    aj.request(param);
};

CH.Dashlet.prototype.saveFromExisting=function(){

    var oThis=this;
    if($("#dash_"+oThis.dashId).length >0){
        alert("This Dashlet already exists in this dashboard");
    }
    else{
        
        var aj=new CH.Ajax();
        var param={
            type:"savefromExisting",
            dashName:oThis.dashName,
            dashType:oThis.dashType,
            dashWidth:oThis.dashWidth,
            dashHeight:oThis.dashHeight,
            dashOrder:oThis.dashOrder,
            dashShared:oThis.dashShared,
            dashData:oThis.dashData,
            dashColId:oThis.dashColId,
            dashColOrder:oThis.dashColOrder,
            dashboardId:oThis.dashboardId,
            dashletId:oThis.dashId
        }
        aj.afterSuccess=function(data){
            var obj=eval("("+data+")");
            if(obj.isError=="0"){

                CH.Dashboard.addDashlet(oThis);
                oThis.draw(CH.Dashboard.mainDiv);
                CH.Dashboard.initResizable("#dash_"+oThis.dashId);
                oThis.render("#content_"+oThis.dashId);

            }
            else{
                log.err(obj.error);
            }
            CH.Loader.hide();
        }
        CH.Loader.show();
        aj.request(param);
    }



};

CH.Dashlet.prototype.appendOtherGraphOption=function(){};

CH.Dashlet.prototype.renderWithFilter=function(col,val){
    
};



/*Graph Dashlet*/


CH.GraphDashlet=function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
    this.dashId=dashId;
    this.dashName=dashName;
    this.dashWidth=dashWidth;
    this.dashHeight=dashHeight;
    this.dashOrder=dashOrder;
    this.dashType=dashType;
    this.dashShared=dashShared;
    this.dashData=dashData;
    this.dashColId=dashColId;
    this.dashColOrder=dashColOrder;
    this.dashboardId=dashboardId;
};
CH.GraphDashlet.prototype=new CH.Dashlet; //inheritance :D
CH.GraphDashlet.prototype.constructor=CH.GraphDashlet;

CH.GraphDashlet.prototype.render=function(ContentDiv){
    alert("Render of Graph");
};

CH.GraphDashlet.prototype.newDashletForm=function(contentDiv){
    var oThis=this;
    
    var cont="<label for='dd_graphType' style='float:left;'>Graph Type: </label><select id='dd_graphType' style='width:200px;'><option title='./../img/chart/chart_column_1_1.png' value='bar1'>Bar Charts</option></select>";

    /* $(contentDiv).append(cont);
    $("#dd_graphType").msDropDown({
        visibleRows:2,
        rowHeight:40
    }).data("dd");*/

    var aj=new CH.Ajax();

    var param={
        type:"getQueries"
    };

    aj.afterSuccess=function(data){

        var que=eval("("+data+")");

        $("#newDashletContent").append("<div style='clear:both'><label for='dd_queries'>Query: </label><select name='dd_queries' id='dd_queries'></select></div>");

        for(var i=0;i<que.length;i++){
            $("#dd_queries").append("<option value='"+que[i].id+"'>"+que[i].name+"</option>");
        }


        fetchColumns($("#dd_queries").val());

        $("#dd_queries").change(function(){
            fetchColumns($(this).val());
        });
    }


    aj.request(param);

    function fetchColumns(reqId){
        //$("#dd_que_col").append("");
        $("#dd_que_col").remove();
        $("#newDashletContent").append("<select id='dd_que_col' class='multiselect' multiple='multiple'></select>");


        var aj=new CH.Ajax();

        var param={
            type:"getColumns",
            requeteId:reqId
        };

        aj.afterSuccess=function(data){

            var obj=eval("("+data+")");

            if(obj.length>0){
                var str=obj[0].name;

                oThis.cacheId=obj[0].cacheId;

                str=str.trim();
                var col=str.split(",");

                for(var i=1;i<col.length;i++){

                    if(col[i]!="" || col[i]!=null || col[i]!=" "){
                        $("#dd_que_col").append("<option value='"+col[i]+"'>"+col[i]+"</option>");
                    }
                }

                $("#dd_que_col").multiselect();

            }
        }

        aj.request(param);

    }//fetch columns

};

/*html Dashlet*/

CH.HtmlDashlet=function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
    this.dashId=dashId;
    this.dashName=dashName;
    this.dashWidth=dashWidth;
    this.dashHeight=dashHeight;
    this.dashOrder=dashOrder;
    this.dashType=dashType;
    this.dashShared=dashShared;
    this.dashData=dashData;
    this.dashColId=dashColId;
    this.dashColOrder=dashColOrder;
    this.dashboardId=dashboardId;
};
CH.HtmlDashlet.prototype=new CH.Dashlet; //inheritance :D
CH.HtmlDashlet.prototype.constructor=CH.HtmlDashlet;

CH.HtmlDashlet.prototype.render=function(contentDiv){
    
    
    var dashData=eval("("+this.dashData+")");
    $(contentDiv).html(unescape(dashData.html));
    
};

CH.HtmlDashlet.prototype.newDashletForm=function(contentDiv){
    var cont="<div style='margin-top:5px;'><label for='txt_html' style='float:left;'>HTML: </label><textarea rows='10' cols='40' id='txt_html' name='txt_html'>Some Html here</textarea></div>";
    $(contentDiv).append(cont);
};

CH.HtmlDashlet.prototype.edit=function(){
    var oThis=this;
    $(".ui-edit-dashlet").prop("title",CH.lang.editDashlet);
    $(".ui-edit-dashlet").dialog({
        resizable:false,
        width:400,
        height:400,
        open:function(event,ui){
            var data=eval("("+oThis.dashData+")");
            var cont="<table><tr><td>Dashlet Name</td><td><input name='inp_edit_name' type='text' class='inp_edit_name' value='"+oThis.dashName+"'/></td></tr><tr><td>HTML</td><td><textarea rows='5' cols='15' id='txt_html' name='txt_html'>"+unescape(data.html)+"</textarea></td></tr></table>";
            $(".ui-edit-dashlet").html(cont);
        },
        buttons:{
            "Save":function(){
                var dhtml=$("#txt_html").val();
                var dashName=$(".ui-edit-dashlet .inp_edit_name").val();
                if(dhtml){
                    dhtml=dhtml.replace(/\n+/g,"");
                    dhtml=escape(dhtml);
                }
                var data={
                    html:dhtml
                }
                oThis.dashData=JSON.stringify(data);
                oThis.dashName=dashName;
                $("#dash_"+oThis.dashId+" .title").html(dashName);
                $("#content_"+oThis.dashId).html(unescape(dhtml));
                oThis.update();
                $(this).dialog("close");
                
            },
            "Cancel":function(){
                $(this).dialog("close");
            }
        }
    });
    
};
CH.HtmlDashlet.prototype.appendMaximizeOption=function(){
    var oThis=this;

    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-max'><span class='ui-icon ui-icon-newwin' title='Maximize Dashlet'></span></div>");
    
    $("#dash_"+this.dashId+" .portlet-header .ui-bar-max").click(function(){

        var cloneContent=$("#dash_"+oThis.dashId+" .portlet-content").clone();
        $(cloneContent).attr("title",oThis.dashName);

        $(cloneContent).dialog({
            height:$(window).height(),
            width:$(window).width(),
            modal: true,
            resizable:false
        });
    });
};

/*URl Dashlet*/
CH.UrlDashlet=function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
    this.dashId=dashId;
    this.dashName=dashName;
    this.dashWidth=dashWidth;
    this.dashHeight=dashHeight;
    this.dashOrder=dashOrder;
    this.dashType=dashType;
    this.dashShared=dashShared;
    this.dashData=dashData;
    this.dashColId=dashColId;
    this.dashColOrder=dashColOrder;
    this.dashboardId=dashboardId;
};
CH.UrlDashlet.prototype=new CH.Dashlet;  //inheritance :D
CH.UrlDashlet.prototype.constructor=CH.UrlDashlet;

CH.UrlDashlet.prototype.render=function(contentDiv){
    
    var dashData=eval("("+this.dashData+")");
    
    var width=this.dashWidth-CH.IFRAME_WIDTH_DIST;
    var height=this.dashHeight-CH.IFRAME_HEIGHT_DIST;
    $(contentDiv).html("<iframe src='"+dashData.url+"' width='"+width+"' height='"+height+"'/>");
 
    
};



CH.UrlDashlet.prototype.newDashletForm=function(contentDiv){

    var cont="<div style='margin-top:5px;'><label for='url' style='float:left;'>Url: </label><input id='inp_url' type='text' name='url'/> </div><span><b>Note:</b>Not all sites allow themselves to be opened in an IFRAME and opening a heavy site here will slow down dashboard.</span><br/><span><b>Sample:</b>http://www.bbcnews.com</span>";
    $(contentDiv).append(cont);

};

CH.UrlDashlet.prototype.edit=function(){
    var oThis=this;
    $(".ui-edit-dashlet").prop("title",CH.lang.editDashlet);
    $(".ui-edit-dashlet").dialog({
        resizable:false,
        width:400,
        height:400,
        open:function(event,ui){
            var data=eval("("+oThis.dashData+")");
            var cont="<table><tr><td>Dashlet Name</td><td><input name='inp_edit_name'  type='text' class='inp_edit_name' value='"+oThis.dashName+"'/></td></tr><tr><td>Url</td><td><input id='inp_url' type='text' name='url' value='"+data.url+"'/></td></tr><tr><td><b>Sample:</b></td><td>http://www.bbcnews.com</td></tr></table>";
            $(".ui-edit-dashlet").html(cont);
        
        },
        buttons:{
            "Save":function(){
                var url=$("#inp_url").val();
                var dashName=$(".ui-edit-dashlet .inp_edit_name").val();
                var data={
                    url:url
                }
                if(CH.validate.haveHttp("#inp_url")){
                    data={
                        url:url
                    }
                }
                else{
                    data={
                        url:"http://"+url
                    }
                }

               
                
                oThis.dashData=JSON.stringify(data);
                oThis.dashName=dashName;
                $("#dash_"+oThis.dashId+" .title").html(dashName);
                oThis.update();
                //alert(CH.IFRAME_WIDTH_DIST-1);
                var cont="<iframe src='"+url+"' width='"+(oThis.dashWidth-CH.IFRAME_WIDTH_DIST)+"' height='"+(oThis.dashHeight-CH.IFRAME_HEIGHT_DIST)+"' />"
                $("#content_"+oThis.dashId).html(cont);

                $("#content_"+oThis.dashId+" iframe").css("width",oThis.dashWidth-CH.IFRAME_WIDTH_DIST);
                $("#content_"+oThis.dashId+" iframe").css("height",oThis.dashHeight-CH.IFRAME_HEIGHT_DIST);
                
                $(this).dialog("close");
            },
            "Cancel":function(){
                $(this).dialog("close");
            }
        }
    });
    
};

CH.UrlDashlet.prototype.appendRefreshOption=function(){
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-refresh-cache'><span class='ui-icon ui-icon-refresh' title='Refresh Url'></span></div>");

        var dat=eval("("+oThis.dashData+")");
        
        $("#dash_"+this.dashId+" .portlet-header .ui-bar-refresh-cache").click(function(){
            var ifram= $("#content_"+oThis.dashId+" iframe").get(0);
            ifram.src = dat.url;
        });

    }
};

CH.UrlDashlet.prototype.appendMaximizeOption=function(){
    var oThis=this;

    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-max'><span class='ui-icon ui-icon-newwin' title='Maximize Dashlet'></span></div>");

    $("#dash_"+this.dashId+" .portlet-header .ui-bar-max").click(function(){

        var cloneContent=$("#dash_"+oThis.dashId+" .portlet-content").clone();
        $(cloneContent).attr("title",oThis.dashName);

        $(cloneContent).dialog({
            width:$(window).width(),
            height:$(window).height(),
            modal: true,
            resizable:false,
            open:function(eve,ui){
                var temp=$(cloneContent).children("iframe").filter(":first");
                if(temp.length==1){
                    $(temp).width($(window).width()-CH.IFRAME_WIDTH_DIST-10);
                    $(temp).height($(window).height()-CH.IFRAME_HEIGHT_DIST-10);
                }
            }
        });
        
    });

};



/**Process graph*/

CH.GraphTableDashlet=function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
    this.dashId=dashId;
    this.dashName=dashName;
    this.dashWidth=dashWidth;
    this.dashHeight=dashHeight;
    this.dashOrder=dashOrder;
    this.dashType=dashType;
    this.dashShared=dashShared;
    this.dashData=dashData;
    this.dashColId=dashColId;
    this.dashColOrder=dashColOrder;
    this.dashboardId=dashboardId;
};
CH.GraphTableDashlet.prototype=new CH.Dashlet; //inheritance :D
CH.GraphTableDashlet.prototype.constructor=CH.ProcessDashlet;
CH.GraphTableDashlet.prototype.newDashletForm=function(contentDiv){
    var html="<fieldset><table style='font-size:8pt;'><tr class='tr_1st'><td><label for='process'>Select Process</label></td><td>";
    var aj=new CH.Ajax();

    var params={
        type:"getProcess"

    };
    aj.request(params);
    aj.afterSuccess=function(data){
        data=$.trim(data);
        $(contentDiv).html(html+data+"</td><td id='td_criteria'></td></tr></table></fieldset>");
        
        $(contentDiv+" #dd_graphTable").change(function(){
            var siblingsTr=$('.tr_1st').siblings();
            $(siblingsTr).remove();
            var val=$(this).val();
            if(val!="--"){
                var aj2=new CH.Ajax();
                var param={
                    type:"getCriteria",
                    dbTable:val
                };
                aj2.afterSuccess=function(data){
                    $("#td_criteria").html(data);
                        
                    if($("#td_criteria .isDate").length>0){
                        $("<tr><td>from</td><td class='td_fromDate'></td></tr><tr><td>To</td><td class='td_toDate'></td></tr>").insertAfter($(".tr_1st"));
                        $(".td_fromDate").html("<input type='text' id='inp_pro_fromDate'/>");
                        $(".td_toDate").html("<input type='text' id='inp_pro_toDate'/>");


                        $("#inp_pro_fromDate").datepicker({
                            showButtonPanel: true,
                            dateFormat: 'dd/mm/yy',
                            changeMonth: true,
                            changeYear: true,
                            showOn:"button",
                            buttonImage: "./img/calendar.gif",
                            buttonImageOnly: true,
                            buttonText:"Choose"
                        });

                        $("#inp_pro_toDate").datepicker({
                            showButtonPanel: true,
                            dateFormat: 'dd/mm/yy',
                            changeMonth: true,
                            changeYear: true,
                            showOn:"button",
                            buttonImage: "./img/calendar.gif",
                            buttonImageOnly: true,
                            buttonText:"Choose"
                        });


                    }
                        
                }
                aj2.request(param);

            }
        });
        
    };
};
CH.GraphTableDashlet.prototype.render=function(cDiv){
    var oThis=this;
    var dashdata=eval("("+oThis.dashData+")");

    var ht="<iframe src='./viewProcess.jsp?dbTable="+dashdata.graphTable+"&criteria="+dashdata.criteria+"&toDate="+dashdata.toDate+"&fromDate="+dashdata.fromDate+"'></iframe>"
    $(cDiv).html(ht);
    
    $(cDiv+" iframe").css("width",oThis.dashWidth-CH.IFRAME_WIDTH_DIST);
    $(cDiv+" iframe").css("height",oThis.dashHeight-CH.IFRAME_HEIGHT_DIST);
    
};
CH.GraphTableDashlet.prototype.appendMaximizeOption=function(){
    var oThis=this;

    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-max'><span class='ui-icon ui-icon-newwin' title='Maximize Dashlet'></span></div>");
    $("#dash_"+this.dashId+" .portlet-header .ui-bar-max").click(function(){

        var cloneContent=$("#dash_"+oThis.dashId+" .portlet-content").clone();
        $(cloneContent).attr("title",oThis.dashName);

        $(cloneContent).dialog({
            width:$(window).width(),
            height:$(window).height(),
            modal: true,
            resizable:false,
            open:function(eve,ui){
                var temp=$(cloneContent).children("iframe").filter(":first");
                if(temp.length==1){

                    $(temp).width($(window).width()-CH.IFRAME_WIDTH_DIST-10);
                    $(temp).height($(window).height()-CH.IFRAME_HEIGHT_DIST-10);

                }
            }
        });

    });

};
CH.GraphTableDashlet.prototype.edit=function(){
    var oThis=this;
    var data=eval("("+oThis.dashData+")");
    $(".ui-edit-dashlet").prop("title",CH.lang.editDashlet);
    $(".ui-edit-dashlet").dialog({
        resizable:false,
        width:400,
        height:400,
        open:function(event,ui){
            var html="<fieldset><table style='font-size:8pt;'><tr><td>Dashlet Name</td><td><input name='inp_edit_name'  type='text' class='inp_edit_name' value='"+oThis.dashName+"'/></td></tr></table></fieldset>";
            /*var aj=new CH.Ajax();

            var params={
                type:"getProcess",
                process:data.process
            };
            aj.request(params);
            aj.afterSuccess=function(data){
                data=$.trim(data);
                $(".ui-edit-dashlet").html(html+data+"</td></tr></table></fieldset>");
            };*/
            $(".ui-edit-dashlet").html(html);
        },
        buttons:{
            "Save":function(){
                /*var data={
                    process:$("#dd_process").val()
                };

                oThis.dashData=JSON.stringify(data);*/
                var dashName=$(".ui-edit-dashlet .inp_edit_name").val();
                oThis.dashName=dashName;
                $("#dash_"+oThis.dashId+" .title").html(dashName);
                oThis.update();
                //alert(CH.IFRAME_WIDTH_DIST-1);
                oThis.render("#content_"+oThis.dashId);
                $(this).dialog("close");
            },
            "Cancel":function(){
                $(this).dialog("close");
            }
        }
    });
    
};




/*JFreeChart*/

CH.JFreeChartDashlet=function(dashId,dashName,dashWidth,dashHeight,dashOrder,dashType,dashShared,dashData,dashColId,dashColOrder,dashboardId){
    this.dashId=dashId;
    this.dashName=dashName;
    this.dashWidth=dashWidth;
    this.dashHeight=dashHeight;
    this.dashOrder=dashOrder;
    this.dashType=dashType;
    this.dashShared=dashShared;
    this.dashData=dashData;
    this.dashColId=dashColId;
    this.dashColOrder=dashColOrder;
    this.dashboardId=dashboardId;
};
CH.JFreeChartDashlet.prototype=new CH.Dashlet;
CH.JFreeChartDashlet.prototype.constructor=CH.JFreeChartDashlet;

CH.JFreeChartDashlet.prototype.newDashletForm=function(contentDiv){
    var oThis=this;

    $(contentDiv).append("<img src='./img/loader.gif' id='loader'>");
    if($.browser.msie){
        
        //         $("#tab0").css("overflow","scroll");
        $("#tab0").css("overflow-y","scroll");
    }
    
    $.ajax({
        url:"./dashboard2_graph_create.jsp"+"?id_tdb="+CH.Dashboard.dashboardId+"&isEdit=0&dbv=2",
        type:"POST",
        cache:false,
        success:function(data){
            $("#loader").remove();
            $(contentDiv).html(data);
            
        }
    });

     
};

CH.JFreeChartDashlet.prototype.save=function(){
    CH.Loader.show();
    var oThis=this;
    var f = document.f1;

    
    if(f!="undefined"){
        
        $.ajax({
            url:"./dashboard2_graph_create.jsp?"+$(f).serialize()+"&valid=Add",
            type:"GET",
            cache:false,
            success:function(graphId){
                graphId=graphId.substr(graphId.indexOf("_GRAPH_ID_=")+10,graphId.length);
                //alert(graphId);
                graphId=graphId.substr(0,graphId.indexOf("_GRAPH_ID_"));
                //alert(graphId);
                graphId=graphId.substr(1,graphId.length);
                if(graphId=="-1"){
                    alert("Unable to generate Graph");
                    
                    CH.Loader.hide();
                }
                else{
                    
                    var dashData={
                        graphId:graphId,
                        drills:new Array()
                    };

                    dashData=JSON.stringify(dashData);
                    oThis.dashData=dashData;
            
            
                    var aj=new CH.Ajax();

                    var param={
                        type:"insertNewDashlet",
                        dashName:oThis.dashName,
                        dashType:oThis.dashType,
                        dashWidth:oThis.dashWidth,
                        dashHeight:oThis.dashHeight,
                        dashOrder:oThis.dashOrder,
                        dashShared:oThis.dashShared,
                        dashData:oThis.dashData,
                        dashColId:oThis.dashColId,
                        dashColOrder:oThis.dashColOrder,
                        dashboardId:oThis.dashboardId
                    }
                
                    aj.afterSuccess=function(data){
                        var obj=eval("("+data+")");
                        if(obj.isError=="0"){
                        
                            oThis.dashId=obj.dashletId;
                            CH.Dashboard.addDashlet(oThis);
                            oThis.ownerDashboard=oThis.dashboardId;
                            oThis.draw(CH.Dashboard.mainDiv);
                            //CH.Dashboard.initResizable("#dash_"+oThis.dashId); /**12-7*/
                            CH.Dashboard.disableResizable(".portlet");
                            CH.Dashboard.initResizable(".portlet");
                            oThis.render("#content_"+oThis.dashId);
                        }
                        CH.Loader.hide();
                    }
                    aj.request(param);

                }//else
            },
            error:function(xhr,textStatus,errorThrown){
                alert("NetworkError: "+textStatus+","+errorThrown);
                CH.Loader.hide();
            }
        });

    }
    else{
        var aj=new CH.Ajax();

        var param={
            type:"insertNewDashlet",
            dashName:oThis.dashName,
            dashType:oThis.dashType,
            dashWidth:oThis.dashWidth,
            dashHeight:oThis.dashHeight,
            dashOrder:oThis.dashOrder,
            dashShared:oThis.dashShared,
            dashData:oThis.dashData,
            dashColId:oThis.dashColId,
            dashColOrder:oThis.dashColOrder,
            dashboardId:oThis.dashboardId
        }


        aj.afterSuccess=function(data){
            
            var obj=eval("("+data+")");
            if(obj.isError=="0"){
                oThis.dashId=obj.dashletId;
                CH.Dashboard.addDashlet(oThis);
                oThis.ownerDashboard=oThis.dashboardId;
                oThis.draw(CH.Dashboard.mainDiv);
                //CH.Dashboard.initResizable("#dash_"+oThis.dashId); /*12-7*/
                CH.Dashboard.disableResizable(".portlet");
                CH.Dashboard.initResizable(".portlet");
                oThis.render("#content_"+oThis.dashId);
                oThis.render("#content_"+data);
            }
            CH.Loader.hide();
        }

        aj.request(param);

    }
};

CH.JFreeChartDashlet.prototype.render=function(contentDiv){
    
    var oThis=this;
    var dashData=eval("("+this.dashData+")");
    if(dashData.graphId && dashData.graph!="" && dashData.graphId.length!=0){
       
        if(dashData.drills.length<=0){
            CH.jfreeGraphCall(oThis,contentDiv,"0",dashData.graphId);
        }
        else{
            var htmlTabs="<div class='vTabs'>"
            htmlTabs+="<ul>";
            htmlTabs+="<li><a href='#vTab_0'>0</a></li>";
            htmlTabs+="</ul>";

            htmlTabs+="<div id='vTab_0'>";

            htmlTabs+="</div>";

            htmlTabs+="</div>";

            $("#content_"+this.dashId).html(htmlTabs);
            
            var delDrillHtml="<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-del-drill'><span class='ui-icon ui-icon-trash' title='Drill'></span></div>";
            $("#content_"+this.dashId).prepend(delDrillHtml);
            $("#dash_"+oThis.dashId+" .ui-bar-del-drill").hide();
            CH.makeHoverButton(); 
            for(var i=0;i<dashData.drills.length;i++){

                $("#dash_"+this.dashId+" .vTabs ul").append("<li><a href='#vTab_"+(i+1)+"'>"+(i+1)+"</a></li>");
                $("#dash_"+this.dashId+" .vTabs").append("<div id='vTab_"+(i+1)+"'>"+"Please wait..."+"</div>");

            }
            
            $("#dash_"+this.dashId+" .vTabs").tabs({
                selected:0,
                select:function(eve,ui){
                    var ind=ui.index;
                    if($("#dash_"+oThis.dashId+" .vTabs #vTab_"+ind+" img").length==0 && ind!=0){
                        
                        var selector="#dash_"+oThis.dashId+" .vTabs #vTab_"+ind;
                        CH.jfreeGraphCall(oThis,selector,"1",dashData.drills[ind-1].graphId);
                        
                    }
                    if(ind!=0){
                        $("#dash_"+oThis.dashId+" .ui-bar-del-drill").show();
                    }
                    else{
                        $("#dash_"+oThis.dashId+" .ui-bar-del-drill").hide();
                    }
                }
            });
            //CH.initDeleteDrill("#dash_"+this.dashId+" .vTabs");
            oThis.initDelDrill();
            $("#dash_"+this.dashId+" .vTabs").addClass('ui-tabs-vertical ui-helper-clearfix').removeClass('ui-widget-content');
            $("#dash_"+this.dashId+" .vTabs li").removeClass('ui-corner-top').addClass('ui-corner-left');
            $("#dash_"+this.dashId+" .vTabs .ui-tabs-panel").css("padding","0");

            if($("#dash_"+oThis.dashId+" .vTabs").length>0){
                contentDiv="#dash_"+oThis.dashId+" #vTab_0";
            }
            CH.jfreeGraphCall(oThis,contentDiv,"0",dashData.graphId);
            
        }
        
    }
    else{
        alert("unable to get the graph Id");
    }
    
};
//render2 is for date
CH.JFreeChartDashlet.prototype.render2=function(contentDiv){
    var oThis=this;
    
    ///////////////FOrDATE

    var dashData=eval("("+this.dashData+")");
    //alert("./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId);
    $.ajax({
        url:"./dashboard2_graph_show.jsp",
        type:"POST",
        data:{
            id_graph_trans:dashData.graphId,
            dashboardId:CH.Dashboard.dashboardId,
            filter:"date",
            dates:$("#inp_toDate").val()+","+$("#inp_fromDate").val()
        },
        cache:false,
        success:function(data){

            data=$.trim(data);

            $(contentDiv).html("<div class='ifTable'>"+data+"</div>");
            var imgJfree;
            if(contentDiv=="#content_xSample"){
                imgJfree=$("#content_xSample #imgDiv img");
                $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);

                var tableau=$("#content_xSample #tableau");

                if(tableau.length>0){
                    $("#content_xSample .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    $("#content_xSample .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                    $("#content_xSample .ifTable").css("overflow","scroll");
                }

            }
            else{
                imgJfree=$("#dash_"+oThis.dashId+" #imgDiv img");
                if(imgJfree.length>0){

                    $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    $(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);

                }
            }


            var tableau=$("#content_"+oThis.dashId+" #tableau");

            if(tableau.length>0){
                $("#content_"+oThis.dashId+" .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $("#content_"+oThis.dashId+" .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                $("#content_"+oThis.dashId+" .ifTable").css("overflow","scroll");
            }
            var qid=$("#content_"+oThis.dashId+" #requete_id").text();
            if(imgJfree.length>0){
                oThis.initGraphClick(oThis.dashId,qid);
            }

        }
    });


};
//adjust render2 and renderWithFilter to on function later.
CH.JFreeChartDashlet.prototype.renderWithFilter=function(col,val){
    var oThis=this;
    var contentDiv="#content_"+this.dashId;
    var dashData=eval("("+this.dashData+")");
    //alert("./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId);
    $.ajax({
        url:"./dashboard2_graph_show.jsp",
        type:"POST",
        data:{
            id_graph_trans:dashData.graphId,
            dashboardId:CH.Dashboard.dashboardId,
            filter:"colVal",
            filterColName:col,
            filterColValues:val
        },
        cache:false,
        success:function(data){
            
            data=$.trim(data);
            $(contentDiv).html("<div class='ifTable'>"+data+"</div>");
            var imgJfree;
            
            imgJfree=$(contentDiv+" #imgDiv img");
            if(imgJfree.length>0){

                $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);

            }

            var tableau=$(contentDiv+" #tableau");

            if(tableau.length>0){
                $(contentDiv+" .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $(contentDiv+" .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                $(contentDiv+" .ifTable").css("overflow","scroll");
            }
            var qid=$(contentDiv+" #requete_id").text();
            if(imgJfree.length>0){
                oThis.initGraphClick(oThis.dashId,qid);
            }

        }
    });

};


CH.JFreeChartDashlet.prototype.edit=function(){
    var oThis=this;
    $(".ui-edit-dashlet-graph").prop("title",CH.lang.editGraph);
    $(".ui-edit-dashlet-graph").dialog({
        resizable:false,
        width:CH.DEFAULT_DIALOG_WIDTH,
        height:CH.DEFAULT_DIALOG_HEIGHT,
        close: function(eve,ui){
            $(".ui-edit-dashlet-graph").html("");
        },
        open:function(event,ui){

            var da=eval("("+oThis.dashData+")");
            $(".ui-edit-dashlet-graph").append("<img src='./img/loader.gif' id='loader'>");
            var reqId=$("#dash_"+oThis.dashId+" .vTabs #vTab_0 #requete_id").text();
            reqId=$.trim(reqId);
            $.ajax({
                url:"./dashboard2_graph_create.jsp?requete_id_trans=&id_graph_trans="+da.graphId+"&visu=&valid_trans=&requete_id="+reqId+"&sql=&id_tdb="+oThis.dashboardId+"&id_graph=&w=null&h=null&isEdit=1&dbv=2",
                type:"POST",
                cache:false,
                success:function(data){
                    $(".ui-edit-dashlet-graph"+" #loader").remove();
                    $(".ui-edit-dashlet-graph").html("<fieldset><table><tr><td>Dashlet Name</td><td><input name='inp_edit_name' type='text' class='inp_edit_name' value='"+oThis.dashName+"'/></td></tr></table></fieldset>"+data);
                    CH.jfreeAfterCreate(".ui-edit-dashlet-graph");
                //$(".ui-edit-dashlet-graph .td_map_form").hide(); //for hiding the map option
                //$(".ui-edit-dashlet-graph .requete_id").prop("disabled","disabled");
                },
                error:function(xhr,textStatus,errorThrown){
                    alert("NetworkError: "+textStatus+","+errorThrown);
                    CH.Loader.hide();
                }
            });

        },
        buttons:{
            "Modify":function(){
                //console.log();
                //$(".ui-edit-dashlet-graph .requete_id").removeAttr("disabled");
                
                var f =$(".ui-edit-dashlet-graph form[name='f1']");
                //alert(f.serialize());
                var bthis=this;
                $.ajax({
                    url:"./dashboard2_graph_create.jsp?"+$(f).serialize()+"&valid=Modify",
                    type:"GET",
                    cache:false,
                    success:function(data){
                        var dashName=$(".ui-edit-dashlet-graph .inp_edit_name").val();
                        oThis.dashName=dashName;
                        $("#dash_"+oThis.dashId+" .title").html(dashName);
                        oThis.update();
                        oThis.render("#content_"+oThis.dashId);
                        $(bthis).dialog("close");
                    },
                    error:function(xhr,textStatus,errorThrown){
                        alert("NetworkError: "+textStatus+","+errorThrown);
                        CH.Loader.hide();
                    }
                });
            },
            "Cancel":function(){
                $(this).dialog("close");
            }
        }
    });
    
};

CH.JFreeChartDashlet.prototype.appendRefreshOption=function(){
    var oThis=this;
    if(!CH.Dashboard.readOnly){
        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-refresh-cache'><span class='ui-icon ui-icon-refresh' title='Refresh Cache'></span></div>");

        var dat=eval("("+oThis.dashData+")");

        $("#dash_"+this.dashId+" .portlet-header .ui-bar-refresh-cache").click(function(){

            var aj=new CH.Ajax();
            var param={
                type:"refreshCache",
                graphId:dat.graphId
            }
            aj.afterSuccess=function(data){
                //log.debug("new Cache Id"+data);
                // alert(data);
                data=$.trim(data);
                var obj=eval("("+data+")");
                
                if(obj.isError=="0"){
                    
                
                    /*$("#dialogWithText").prop("title","Notification");
                    $("#dialogWithText").dialog({
                        resizable:false,
                        width:200,
                        hide:"fade",
                        open:function(eve,ui){
                            $(this).text("Cache Refreshed");
                            setTimeout( function(){
                                $("#dialogWithText").dialog("close");
                            } , 1500);
                        }
                    });*/

                    $("#dialog-box").myLog("show");
                    $("#dialog-box").myLog("clear");
                    $("#dialog-box").myLog("setTitle","Log");
                    $("#dialog-box").myLog("setAutoHide",false);
                    $("#dialog-box").myLog("msg","Cache Refreshed, new cacheId="+obj.cacheId);

                    oThis.render("#content_"+oThis.dashId);
                }else{
                    $("#dialog-box").myLog("show");
                    $("#dialog-box").myLog("setTitle","Log");
                    $("#dialog-box").myLog("setAutoHide",false);
                    $("#dialog-box").myLog("err",obj.error);
                }
            };
            aj.onError=function(xhr,textStatus,errorThrown){
                $("#dialog-box").myLog("show");
                $("#dialog-box").myLog("setTitle","Log");
                $("#dialog-box").myLog("setAutoHide",false);
                $("#dialog-box").myLog("err",errorThrown);
                $("#dialog-box").myLog("err","Unable to refresh Cache");
                
            };
            aj.request(param);

        //alert("Refresh Cache (bugs pending)");
        });
    }
};
CH.JFreeChartDashlet.prototype.appendPlusOption=function(){
    var oThis=this;
    var inReqId="";
    var newGraphId="";
    
    if(!CH.Dashboard.readOnly){

        $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-plus'><span class='ui-icon ui-icon-plus' title='Drill'></span></div>");
        var step=0;
        $("#dash_"+this.dashId+" .portlet-header .ui-bar-plus").click(function(){
            var qid=$("#content_"+oThis.dashId+" #requete_id");
            qid=$(qid[0]).text();
            //alert("plus append option");
            step=0;
            $(".plusDialog").dialog({
                width:CH.DEFAULT_DIALOG_WIDTH,
                height:CH.DEFAULT_DIALOG_HEIGHT,
                resizable:false,
                open:function(eve,ui){
                    firstStep(qid);
                    step=0;
                },
                buttons:[
                {
                    id:"bt_plus_pre",
                    text:"Previous",
                    click:function(){
                        if(step>0){
                            if(step%2==0){
                                
                            }
                            else if(step%2==1){
                                $(".stepGraph").hide();
                                $(".step1").show("slide");
                                $("#bt_plus_next span").text("Next");
                                $("#bt_plus_pre").button("disable");
                                $(".plusDialog").dialog('option','width',CH.DEFAULT_DIALOG_WIDTH);
                                
                                if(inReqId.length>0){
                                    var aj=new CH.Ajax();
                                    aj.afterSuccess=function(data){
                                    
                                    };
                                    var param={
                                        type:"removeDrillRequete",
                                        requeteId:inReqId
                                    }
                                    aj.request(param);
                                }
                                
                            }
                            step-=1;
                        }
                    }
                },
                { 
                    id:"bt_plus_next",
                    text:"Next",
                    click:function(){
                        if(step<2){
                            
                            if(step%2==0){
                                $(".plusDialog").dialog('option','width',800);
                        
                                getGraphForm(qid);
                                $("#bt_plus_pre").button("enable");
                                
                            }
                            else if(step%2==1){
                                
                                saveGraphStep();
                            }
                            step+=1;
                        }
                    }
                }
                ]
                
            });

        });//click
        
        /**helper-functons**/
        var newReqId="";
        
        function firstStep(requeteId){

            
            $(".step1 div").html("");
            $(".stepGraph").hide();
            $("#groupByCols").html("");
            $.ajax({
                url:"./groupByDrill.jsp?requeteId="+requeteId,
                type:"GET",
                cache:false,
                success:function(data){
                    $(".step1").show('slide');
                    $(".step1 div").html(data);
                    $("#groupByCols").multiselect();
                }
            });

        }
        function getGraphForm(qid){
            var groupBy=$("#groupByCols").val();
            var param={
                type:"saveDrillRequete",
                requeteId:qid,
                groupBy:groupBy+""
            };
            
            var aj=new CH.Ajax();
            aj.afterSuccess=function(data){
                inReqId=$.trim(data);
                newReqId=inReqId;
                $.ajax({
                    url:"./dashboard2_graph_create.jsp?dbv=2",
                    type:"POST",
                    cache:false,
                    data:{
                        isDrill:"1",
                        requete_id:newReqId,
                        requete_id_trans:newReqId
                    },
                    success:function(data){
                        $(".step1").hide();
                        $(".stepGraph").html(data);
                        CH.jfreeAfterCreate(".stepGraph");
                        $(".stepGraph").show('slide');
                        $("#bt_plus_next span").text("Done");
                    },
                    error:function(jqXHR, textStatus, errorThrown){
                        alert("Error:"+textStatus+"."+errorThrown);
                        step--;
                        firstStep(qid);
                    }
                    
                });

            }
            aj.request(param);
            
        }
        function saveGraphStep(){
            
            $(".stepGraph #hidden_requete_id").val(newReqId);
            var f =$(".stepGraph form[name='f1']");
            
            if(f!="undefined"){
                $.ajax({
                    url:"./dashboard2_graph_create.jsp?id_tdb="+CH.Dashboard.dashboardId+"&"+$(f).serialize()+"&valid=Add",
                    type:"GET",
                    cache:false,
                    success:function(graphId){
                        
                        graphId=graphId.substr(graphId.indexOf("_GRAPH_ID_=")+10,graphId.length);
                        //alert(graphId);
                        graphId=graphId.substr(0,graphId.indexOf("_GRAPH_ID_"));
                        //alert(graphId);
                        graphId=graphId.substr(1,graphId.length);
                        if(graphId=="-1"){
                            alert("Unable to generate Graph");
                        }else{
                            
                            var drill={
                                graphId:graphId
                            }
                            var dat=eval("("+oThis.dashData+")");
                            dat.drills.push(drill);
                            oThis.dashData=JSON.stringify(dat);
                            
                            oThis.update();
                            oThis.render();
                            $(".plusDialog").dialog("close");
                        }
                    }
                });
            }
            
            
            
        /****/
        }

    }

    
}
CH.JFreeChartDashlet.prototype.appendMaximizeOption=function(){
    var oThis=this;

    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-max'><span class='ui-icon ui-icon-newwin' title='Maximize Dashlet'></span></div>");

    $("#dash_"+this.dashId+" .portlet-header .ui-bar-max").click(function(){

        
        var cloneContent=$("#dash_"+oThis.dashId+" .portlet-content").clone();
        $(cloneContent).attr("title",oThis.dashName);
        $(cloneContent).attr("id","cloned");
        var height=$(window).height();
        var width=$(window).width();

        if($.browser.msie){
            height=1000;
        //width=800;
        }


        $(cloneContent).dialog({
            modal: true,
            resizable:false,
            height:height,
            width:width,
            close:function(eve,ui){
                $(this).html(" ");
                cloneContent=null;
                $("#cloned").remove();
            //                $("#dash_"+oThis.dashId).show();//for maps
            },
            open:function(eve,ui){
                var obj=$("#cloned #mapFrame");
                if(obj.length>0){
                    $("#cloned").html("");

                    var dashData=eval("("+oThis.dashData+")");

                    $.ajax({
                        url:"./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId+"&graphGroup=1&dashId="+oThis.dashId,
                        type:"GET",
                        cache:false,
                        success:function(data){
                            $("#cloned").html(data);
                            $("#cloned #map").prop("id","mapMax");
                            init("mapMax");
                            $("#cloned #mapFrame").width(width-CH.JFREEGRAPH_WIDTH_DIST);
                            $("#cloned #mapFrame").height(height-CH.JFREEGRAPH_HEIGHT_DIST);

                        }
                    });


                }
                else{
                
                    var temp=$("#cloned #imgDiv img");
                
                    //if(temp.length==1){
                    //  alert("yes image");
                    $(temp).width(width-CH.JFREEGRAPH_WIDTH_DIST-10);
                    $(temp).height(height-CH.JFREEGRAPH_HEIGHT_DIST-10);
                    //}
                
                    var tableau=$("#cloned #tableau");
                
                    temp=$("#cloned .ifTable");
                    //if(tableau.length>0){
                    //alert("yes table");
                    $(temp).width(width-CH.JFREEGRAPH_WIDTH_DIST-10);
                    $(temp).height(height-CH.JFREEGRAPH_HEIGHT_DIST-10);
                    $("#cloned #mapFrame").width(width-CH.JFREEGRAPH_WIDTH_DIST-10);
                    $("#cloned #mapFrame").height(height-CH.JFREEGRAPH_HEIGHT_DIST-10);
                
                    /*$("#cloned .olControlAttribution").css("z-index","1200");
                $("#cloned .olControlPanZoomBar").css("z-index","1200");
                $("#cloned .olControlPanel").css("z-index","1200");
                $("#cloned .olControlLayerSwitcher").css("z-index","1200");
                $("#cloned .olMap").css("z-index","1100");
                $("#cloned .olMapViewport").css("z-index","1100");*/

                    //$("#dash_"+oThis.dashId).hide(); //for maps

                    $(temp).css("margin-left","15px");
                //}
                }
            }
            
        });
        
    });


};
CH.JFreeChartDashlet.prototype.appendOtherGraphOption=function(){
    
    var oThis=this;
    
    $("#dash_"+this.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-graph-group'><span class='ui-icon' title='Group Graph Entities'>G/span></div>");
    $("#dash_"+this.dashId+" .ui-bar-graph-group").click(function(){
        $("#otherGraphDailog").dialog({
            resizable:false,
            modal:true,
            width:600,
            height:400,
            open:function(eve,ui){

                var dashData=eval("("+oThis.dashData+")");
                //alert("./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId);
                $.ajax({
                    url:"./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId+"&graphGroup=0",
                    type:"GET",
                    cache:false,
                    success:function(data){
                        $("#otherGraphDailog .content").html(data);
                    }
                });


                
            }
        });
    });

};
/*not used groupgraph*/
CH.JFreeChartDashlet.prototype.renderGroupGraph=function(entities){
    var contentDiv="#content_"+this.dashId;

    var oThis=this;
    var dashData=eval("("+this.dashData+")");
    //alert("./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId);
    $.ajax({
        url:"./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId+"&graphGroup=1&entities="+entities,
        type:"POST",
        
        cache:false,
        success:function(data){

            data=$.trim(data);

            $(contentDiv).html("<div class='ifTable'>"+data+"</div>");
            var imgJfree;
            if(contentDiv=="#content_xSample"){
                imgJfree=$("#content_xSample #imgDiv img");
            }
            else{
                imgJfree=$("#dash_"+oThis.dashId+" #imgDiv img");
            }

            if(imgJfree.length>0){
                $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);

            }

            var tableau=$("#content_"+oThis.dashId+" #tableau");

            if(tableau.length>0){
                $("#content_"+oThis.dashId+" .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                $("#content_"+oThis.dashId+" .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                $("#content_"+oThis.dashId+" .ifTable").css("overflow","scroll");
            }
            var qid=$("#content_"+oThis.dashId+" #requete_id").text();

        }
    });
    
};

CH.JFreeChartDashlet.prototype.setGroupGraph=function(entities){

    var aj=new CH.Ajax();
    var oThis=this;
    var param={
        type:"updateGraphGroupCol",
        dashletId:oThis.dashId,
        entities:entities
    };
    
    aj.afterSuccess=function(data){
        var obj=eval("("+data+")");
        if(obj.isError=="0"){
            $("#tab1Dialog").dialog("close");
            oThis.render("#content_"+oThis.dashId);
        }
        else{
            log.err(obj.error);
        }
        
    }
    aj.request(param);
    

};

CH.JFreeChartDashlet.prototype.initGraphClick=function(dashID,queryId){
    /** warning: old and dirty code :D **/
    
    var oThis=this;
    var arrColor=new Array();
    var remColorIndex=0;
        
    if(!CH.Dashboard.readOnly){
        if($("#dash_"+oThis.dashId+" .ui-bar-graphClick").length<1){
            $("#dash_"+oThis.dashId+" .portlet-header").append("<div class='ui-state-default ui-corner-all ui-bar-button ui-bar-graphClick'><span class='ui-icon ui-icon-calculator' title='Graph Option'></span></div>");
            $("#dash_"+oThis.dashId+" .portlet-header .ui-bar-graphClick").click(function(){
                
                $("#tab1Dialog").dialog({
                    modal:true,
                    width:CH.DEFAULT_DIALOG_WIDTH,
                    height:CH.DEFAULT_DIALOG_HEIGHT,
                    resizable:false,
                    buttons:{
                        "Done":function(){
                            var ind=$("#tab1").tabs( "option", "selected" );
                            if(ind==0){
                                CH.Dashboard.reRenderGraphs();
                                $("#tab1Dialog").dialog("close");
                            }
                            else if(ind==1){
                                var finInd=CH.Dashboard.findIndex(dashID);
                                var dash=CH.Dashboard.dashlets[finInd];

                                var ent_val=$("#groupGraph #dd_entities").val();

                                dash.setGroupGraph(ent_val+"");
                            
                            }
                        }
                    },
                    close:function(eve,ui){
                        $("#groupGraph").html("");
                    },
                    open:function(eve,ui){
                    
                        $("#tab1").tabs({
                            create:function(eve,ui){
                            // groupGraph("#groupGraph");
                            },
                            select:function(eve,ui){
                            
                                var ind=ui.index;
                                $("#groupGraph").html(" ");
                            
                                if(ind=="0"){
                                    //for color
                                    $("#graphColor").html("<div><label for='dd_type'>Color for:</label><select name='dd_type' id='dd_colorType'><option value='-1'>--</option><option value='0'>Column</option><option value='1'>Values</option></select></div>");
                                    $("#graphColor").append("<div><div style='float:left;'>Query Name:</div><div name='dd_que' id='dd_que'>loading...</div></div>");
                                    $("#graphColor").append("<div id='columnDiv'></div>");
                                    $("#graphColor").append("<div id='valDiv'></div>");
                                
                                    $("#graphColor").append("<div id='colorSelector2'><div style='background-color:#0000FF;'></div></div>");

                                    $("#graphColor").append("<button id='bt_color_submit'>add</button>");
                                    $("#graphColor #bt_color_submit").button();
                                    $("#graphColor #bt_color_submit").attr("disabled",true);
                                    $("#graphColor").append("<ul id='color_list'></ul>");

                                    var colorRGB={
                                        r:247,
                                        b:15,
                                        g:15
                                    };

                                    $('#colorSelector2').ColorPicker({
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

                                    $("#graphColor #bt_color_submit").unbind('click');
                                    $("#graphColor #bt_color_submit").click(function(){
                                        submitColor(colorRGB);
                                    });

                                    getColorList("#graphColor "+"#color_list");


                                    $("#graphColor #dd_colorType").change(function(){
                                        $("#graphColor #valDiv").html("");
                                        $("#columnDiv").html("");
                                        $("#bt_color_submit").attr("disabled",true);

                                        if($("#graphColor #dd_colorType").val()!="-1"){

                                            var aj=new CH.Ajax();
                                            var param={
                                                type:"getQueryInfo",
                                                reqId:queryId
                                            };
                                            aj.afterSuccess=function(data){
                                                $("#loader").remove();
                                                var obj=eval("("+data+")");
                                               
                                                $("#graphColor #dd_que").html(obj.name);
                                                if($("#graphColor #dd_colorType").val()=="0"){
                                                    $("#columnDiv").html("<label for='dd_cols'>Column</label><select id='dd_cols'></select>");
                                                    getColumns(queryId);
                                                }
                                                else if($("#graphColor #dd_colorType").val()=="1"){
                                                    $("#columnDiv").html("");
                                                    getValeurs(queryId);
                                                }

                                            }

                                            $("#graphColor").append("<img src='./img/loader.gif' id='loader'>");
                                            aj.request(param);
                                        }
                                    });


                                    $("#graphColor #dd_colorType").prop("selectedIndex",1);
                                    $("#graphColor #dd_colorType").change();

                                /*$("#graphColor #dd_que").change(function(){

                                        //alert($(this).val());
                                        if($(this).val()!=null){
                                            
                                            $("#bt_color_submit").attr("disabled",true);
                                            $("#graphColor #valDiv").html("");
                                            if($("#graphColor #dd_colorType").val()=="0"){
                                                $("#columnDiv").html("<label for='dd_cols'>Column</label><select id='dd_cols'></select>");
                                                getColumns($("#graphColor #dd_que").val());
                                            }
                                            else if($("#graphColor #dd_colorType").val()=="1"){
                                                $("#columnDiv").html("");
                                                getValeurs($("#graphColor #dd_que").val());
                                            }
                                        }
                                    });
                                    $("#graphColor #dd_que").change();*/
                                 
                                }
                                else{
                                    groupGraph("#groupGraph");
                                }
                            }
                        });

                        $("#tab1").tabs("select",0);
                        $("#tab1").tabs("select",1);
                    }
                });
            
            }); 
            
            
            /***Helper function starts**/
            
            /**group Graph functionality**/
            function groupGraph(selector){
                
                var finInd=CH.Dashboard.findIndex(dashID);
                var dash=CH.Dashboard.dashlets[finInd];

                $(selector).append("<div>"+CH.lang.groupValues+"</div>");
            
                var dashData=eval("("+dash.dashData+")");
                CH.Loader.show();
                $.ajax({
                    url:"./dashboard2_graph_show.jsp?id_graph_trans="+dashData.graphId+"&dashboardId="+CH.Dashboard.dashboardId+"&graphGroup=0"+"&dashId="+dash.dashId+"&isDrill=0",
                    type:"GET",
                    cache:false,
                    success:function(data){
                    
                        $(selector).append(data);
                        $(selector +" table").remove();
                        $(selector+" #dd_entities").addClass("multiselect");
                        $(selector+" #dd_entities").multiselect();
                        CH.Loader.hide();
                    }
                });


            }

            /************Functions for graph Color************/
            //helper func
            function getValeurs(requeteId){
                
                var aj=new CH.Ajax();
                var param={
                    type:"getValeurs",
                    requeteId:requeteId
                };

                aj.afterSuccess=function(data){
                    //log.err(data);
                    //alert($("#valDiv").length);
                    
                    
                    $("#valDiv").html(data);

                    $("#valDiv #dd_valuer").unbind('change');
                    $("#valDiv").append("<div id='valuesDiv'><div>");
                    $("#valDiv #dd_valuer").change(function(){
                        $("#valDiv #valuesDiv").html();
                        CH.Loader.show();
                        $.ajax({
                            url:"./liste_valeur.jsp",
                            type:"POST",
                            cache:false,
                            data:{
                                d:'a',
                                g:0,
                                id:$("#graphColor #valDiv .cacheId").text(),
                                champ:$("#dd_valuer").val(),
                                fromGraphColor:0
                            },
                            success:function(data){
                                $("#graphColor #valDiv #valuesDiv").html(data);
                                $("#bt_color_submit").attr("disabled",false);
                                CH.Loader.hide();
                            }
                        });



                    });
                    $("#graphColor #valDiv #dd_valuer").change();


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
                    
                    var obj=eval("("+data+")");
                    if(obj.isError=="0"){
                        remColorIndex++;
                        arrColor.push({
                            columnName:col,
                            color:colorRGB.r+","+colorRGB.g+","+colorRGB.b
                        });
                        var i=arrColor.length;
                    
                        $("#graphColor #color_list").prepend("<li style='list-style:none;' id='li_color_"+(i-1)+"' title='Click to remove'><span style='float:left;'>"+col+ "</span><button id='btRemoveColor_"+(i-1)+"'>Remove</button><div class='colorBox' style='background-color:rgb("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+");'></div><div style='clear:both;'></div></li>");
                    
                        $("#graphColor #color_list #btRemoveColor_"+(i-1)).click(function(){
                            var ind=$(this).prop("id");
                            ind=ind.substr(ind.indexOf("_")+1,ind.length);
                            removeColor(arrColor[ind].columnName,ind);
                        });

                        $("#btRemoveColor_"+(i-1)).button();
                    }
                    else{
                    //log.err("failed insertion");
                    }
                    CH.Loader.hide();
                }
                if(bool){
                    CH.Loader.show();
                    aj.request(param);
                }


            }

            function getColorList(selector){
                /*fetching columsn already assigned color */

                var aj2=new CH.Ajax();
                aj2.afterSuccess=function(data){
                    
                    var dat=eval("("+data+")");
                    //arrColor={};
                    if(dat.isError=="0"){
                        var obj=dat.colors;
                        arrColor=obj;
                        for(var i=0;i<obj.length;i++){
                            var col=obj[i].columnName;
                            //$(selector).prepend("<li style='list-style:none;' id='"+col+"' title='Click to remove'><span style='float:left;'>"+col+ "</span><div style='width:15px;height:15px;background-color:rgb("+obj[i].color+");float:right'></div><div style='clear:both;'></div></li>");

                            $(selector).prepend("<li style='list-style:none;' id='li_color_"+i+"' title='Click to remove'><span style='float:left;'>"+col+ "</span><button id='btRemoveColor_"+i+"'>Remove</button><div class='colorBox' style='background-color:rgb("+obj[i].color+");'></div><div style='clear:both;'></div></li>");

                            $("#btRemoveColor_"+i).button();

                            $("#btRemoveColor_"+i).click(function(){
                                var ind=$(this).prop("id");
                                ind=ind.substr(ind.indexOf("_")+1,ind.length);
                                removeColor(arrColor[ind].columnName,ind);
                            });
                            remColorIndex=i;
                        }
                    }
                    else{
                        $("#dialog-box").myLog("setTitle","Log");
                        $("#dialog-box").myLog("clear");
                        $("#dialog-box").myLog("centerAlign");
                        $("#dialog-box").myLog("show");
                        $("#dialog-box").myLog("err",dat.error);
                    }
                }
                 
                var param2={
                    type:"getGraphColors",
                    dashboardId:CH.Dashboard.dashboardId
                }

                aj2.request(param2);
       
            }

            function removeColor(id,ind){
                //var temp = document.getElementById(id);
                var aj= new CH.Ajax();
                aj.afterSuccess=function(data){
                    data=$.trim(data);
                    CH.Loader.hide();
                    data=eval("("+data+")");
                    //alert("in remove color="+data);
                    if(data.isError=="0"){
                        
                        var temp=$("#btRemoveColor_"+ind).parent("li:first");
                        temp=($(temp).prop("id"));
                        $("#"+temp).fadeOut(200,function(){
                            $("#"+temp).remove();
                        });
                    }
                    else{
                        $("#dialog-box").myLog("setTitle","Log");
                        $("#dialog-box").myLog("clear");
                        $("#dialog-box").myLog("centerAlign");
                        $("#dialog-box").myLog("show");
                        $("#dialog-box").myLog("err",data.error);
                    }
                }
                
                var param={
                    type:"removeGraphColor",
                    dashboardId:CH.Dashboard.dashboardId,
                    columnName:id
                }
                CH.Loader.show();
                aj.request(param);
            }

            function getColumns(requeteId){
                
                $("#graphColor").append("<img src='./img/loader.gif' id='loader'>");
                var aj= new CH.Ajax();
                var param={
                    type:"getColumns",
                    requeteId:requeteId
                }
                aj.afterSuccess=function(data){
                
                    $("#graphColor #dd_cols").html("");
                    $("#loader").remove();
                    
                    var dat=eval("("+data+")");
                    if(dat.isError=="0"){

                        var obj=(dat.name).split(",");
                        for(var i=0;i<obj.length;i++){
                            if(obj[i]!=""){
                                $("#graphColor #dd_cols").append("<option value='"+obj[i]+"'>"+obj[i]+"</option>");
                            }
                        }
                        $("#bt_color_submit").attr("disabled",false);
                        
                    }
                    else{
                        $("#dialog-box").myLog("setTitle","Log");
                        $("#dialog-box").myLog("clear");
                        $("#dialog-box").myLog("centerAlign");
                        $("#dialog-box").myLog("show");
                        $("#dialog-box").myLog("err",dat.error);
                    }
                    CH.Loader.hide();
                }
                CH.Loader.show();
                aj.request(param); 

            }

            function getColValues(selector,colName){

                var aj=new CH.Ajax();
                var param={
                    type:"getColValue",
                    requeteId:$("#graphColor #dd_que").val(),
                    colName:colName
                };
                aj.afterSuccess=function(data){
                    $(selector).html(data);
                }
                aj.request(param);
            }
 
            
            
            
        /**************ends****************/
            
        }
        
    }
     
};

CH.JFreeChartDashlet.prototype.initDelDrill=function(){
    var oThis=this;
    var dashId= "#dash_"+this.dashId;
    var dashData=eval("("+this.dashData+")");
    $(dashId+" .ui-bar-del-drill").unbind("click");
    $(dashId+" .ui-bar-del-drill").click(function(){
        var selected = $(dashId+" .vTabs").tabs( "option", "selected" );
        
        
        var aj= new CH.Ajax();
        var param={
            type:"deleteDrill",
            graphId:dashData.drills[selected-1].graphId,
            drillNum:selected
        }
        aj.afterSuccess=function(data){
            var dat=eval("("+data+")");   
            //if(dat.isError=="0"){
                
            dashData.drills=dashData.drills.splice(dat.drillNum,1);
                
            oThis.dashData=JSON.stringify(dashData);
            oThis.update();
            $("#dash_"+oThis.dashId+" .vTabs").tabs("remove",dat.drillNum);
            if($("#dash_"+oThis.dashId+" .vTabs").tabs("length")<=1){
                oThis.render("#content_"+oThis.dashId);
            }
        /*}else{
                alert(dat.err);
            }*/
        };
        aj.request(param);
        
        
    });
    
};


/*different method*/
CH.jfreeGraphQuerySubmit=function(id_requete, what){
    
    var f = document.f1;
    //f.requete_id_trans.value = id_requete;
    $("#hidden_requete_id").val(id_requete);
    f.action = "./dashboard2_graph_create.jsp";
    f.target="_self";
    
    //f.submit();
    $("#newDashletContent").append("<img src='./img/loader.gif' id='loader'>");
    
    $.ajax({
        url:"./dashboard2_graph_create.jsp?"+$(f).serialize()+"&dbv=2&isEdit="+what,
        type:"GET",
        cache:false,
        success:function(data){
            $("#loader").remove();
            if(what=="1"){ //what thing will not work in a case.
                $(".ui-edit-dashlet-graph").html(data);
                CH.jfreeAfterCreate(".ui-edit-dashlet-graph");
            }
            else if(what=="0"){
                $("#newDashletContent").html(data);
                CH.jfreeAfterCreate("#newDashletContent");
            }

            
        //$(".td_map_form").hide(); // for hiding map option.
            
        }
    });
    
};

CH.jfreeAfterCreate=function(idHandler){

    //$(idHandler+" table").css("font-size","8pt");

    //$(idHandler+" .graphTypeClass input").customInput();
    
    $(idHandler+" .select_type_graph").hide();

    $(idHandler+" .select_type_graph").msDropDown({
        visibleRows:5,
        rowHeight:50
    });
    
    

    $(idHandler+" .select_type_graph").css("height","200");
    
    $(idHandler+" .select_type_graph").change(function(){

        var temp=$(this).val();
        if(temp=="map"){
            $('#map_data').show();
        }
        else{
            $('#map_data').hide();
        }
        
        if (temp=="pie" || temp=="radar"){
            hideSecondY();
        }
        else{
            showSecondY();
        }

    });

//$("#compteur_select").multiselect();
    
};

CH.jfreeGraphModify=function(selector,id_graph){
    var f = document.f1;
    
    f.action = "./dashboard2_graph_create.jsp";
    f.target="_self";
    f.id_graph_trans.value = id_graph;
    $(selector).append("<img src='./img/loader.gif' id='loader'>");

    //alert($(f).serialize());
    //alert($(f).serialize());

    $.ajax({
        url:"./dashboard2_graph_create.jsp?"+$(f).serialize(),
        type:"POST",
        cache:false,
        success:function(data){
            $(selector+" #loader").remove();
            $(selector).html(data);
        //$(selector+" .td_map_form").hide(); //for hiding map option
        }
    });
 
};
CH.jfreeAddMenu=function(selector){
    
    /**check if there is already sum function**/
    /*  
    var col=$(selector).text();
    
    $.contextMenu({
        selector: selector,
        callback: function(key, options) {
    
            if(key==="REMOVE"){
                var temp=$(selector+" p").text();
                temp=$.trim(temp);
                if(temp.indexOf("(")!="-1"){
                    temp=temp.substr(temp.indexOf("(")+1,temp.indexOf(")")-temp.indexOf("(")-1);
                    $(selector+" p").text(temp);
                }
                else{
                    alert("There is no function to remove");
                }
            }
            else{
                var temp=$(selector+" p").text();
                temp=$.trim(temp);
                if(temp.indexOf("(")!="-1"){
                    temp=temp.substr(temp.indexOf("(")+1,temp.indexOf(")")-temp.indexOf("(")-1);
                    
                    $(selector+" p").text(key+"("+temp+")");
                }
                else{
                    $(selector+" p").text(key+"("+$.trim($(selector+" p").text())+")");
                }
                    
            }
                
        },
        items: {
            "SUM": {
                name: "SUM"
            },
            "COUNT":{
                name:"COUNT"
            },
            "AVG":{
                name:"AVG"
            },
            "MIN":{
                name:"MIN"
            },
            "MAX":{
                name:"MAX"
            },
            "BIT":{
                name:"BIT",
                items:{
                    "BIT_AND":{
                        name:"BIT_AND"
                    },
                    "BIT_OR":{
                        name:"BIT_OR"
                    },
                    "BIT_XOR":{
                        name:"BIT_XOR"
                    }
                }
            },
            "GROUP_CONCAT":{
                name:"GROUP_CONCAT"
            },
            "STD":{
                name:"STD",
                items:{
                    "STD":{
                        name:"STD"
                    },
                    "STDDEV_POP":{
                        name:"STDDEV_POP"
                    },
                    "STDDEV_SAMP":{
                        name:"STDDEV_SAMP"
                    },
                    "STDDEV":{
                        name:"STDDEV"
                    }
                }
            },
            "VAR":{
                name:"VAR",
                items:{
                    "VAR_POP":{
                        name:"VAR_POP"
                    },
                    "VAR_SAMP":{
                        name:"VAR_SAMP"
                    },
                    "VARIANCE":{
                        name:"VARIANCE"
                    }
                }
            },
            "sep":"---------",
            "REMOVE":{
                name:"REMOVE FUNCTION"
            }
        }
    });
*/
    
    $(selector).contextMenu({
        menu: 'myMenu'
    },
    function(action, el, pos) {
        var key=action;
        if(key==="REMOVE"){
            var temp=$(selector+" p").text();
            temp=$.trim(temp);
            if(temp.indexOf("(")!="-1"){
                temp=temp.substr(temp.indexOf("(")+1,temp.indexOf(")")-temp.indexOf("(")-1);
                $(selector+" p").text(temp);
            }
            else{
                alert("There is no function to remove");
            }
        }
        else{
            var temp=$(selector+" p").text();
            temp=$.trim(temp);
            if(temp.indexOf("(")!="-1"){
                temp=temp.substr(temp.indexOf("(")+1,temp.indexOf(")")-temp.indexOf("(")-1);
                    
                $(selector+" p").text(key+"("+temp+")");
            }
            else{
                $(selector+" p").text(key+"("+$.trim($(selector+" p").text())+")");
            }
                    
        }
    });
    
    
    
};
//for drill functionality: jfreegraphcall
CH.jfreeGraphCall=function(oThis,contentDiv,isDrill,graphId){
    
    
    var rWidth=oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST;
    var rHeight=oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST
    
    /* if(rHeight>rWidth){
        rHeight=rWidth;
    }
    else{
        rWidth=rHeight;
    }*/
    
    var dat={
        drill:isDrill,
        width:rWidth, //same width height .
        height:rHeight
    };
    
    
    $.ajax({
        url:"./dashboard2_graph_show.jsp?id_graph_trans="+graphId+"&dashboardId="+CH.Dashboard.dashboardId+"&graphGroup=1&dashId="+oThis.dashId,
        type:"POST",
        cache:false,
        data:dat,
        success:function(data){
            
            
            data=$.trim(data);
            $(contentDiv).html("<div class='ifTable'>"+data+"</div>");
            //init();
            var isError=$(contentDiv+" #getChartError");
            if(isError.length>0){
                $("#dialog-box").myLog("show");
                $("#dialog-box").myLog("centerAlign");
                $("#dialog-box").myLog("setTitle","ERROR");
                $("#dialog-box").myLog("err",$(isError).html());
                $("#dialog-box").myLog("err","Error Rendering Graph, Dashlet:"+oThis.dashId+","+oThis.dashName);
                $(contentDiv).html("");
            }
            else{
                if($(contentDiv+" #mapFrame").length>0){
                    $(contentDiv+" #map").prop("id","map_"+oThis.dashId);
                    init("map_"+oThis.dashId); //of  map
                    $(contentDiv+" #mapFrame").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    $(contentDiv+" #mapFrame").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                    $(contentDiv+" .olControlAttribution").css("z-index","800");
                    $(contentDiv+" .olControlPanZoomBar").css("z-index","800");
                    $(contentDiv+" .olControlPanel").css("z-index","800");
                    $(contentDiv+" .olControlLayerSwitcher").css("z-index","800");
                }

                var imgJfree;
                if(contentDiv=="#content_xSample"){

                    imgJfree=$("#content_xSample #imgDiv img");
                    $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    $(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);

                    var tableau=$("#content_xSample #tableau");

                    if(tableau.length>0){
                        $("#content_xSample .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                        $("#content_xSample .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                        $("#content_xSample .ifTable").css("overflow","scroll");
                    }
                }
                else{
                    imgJfree=$(contentDiv+" #imgDiv img");
                    if(imgJfree.length>0){

                    // $(imgJfree).width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    //$(imgJfree).height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                    }
                }

                var tableau=$(contentDiv+" #tableau");

                if(tableau.length>0){
                    $(contentDiv+" .ifTable").width(oThis.dashWidth-CH.JFREEGRAPH_WIDTH_DIST);
                    $(contentDiv+" .ifTable").height(oThis.dashHeight-CH.JFREEGRAPH_HEIGHT_DIST);
                    $(contentDiv+" .ifTable").css("overflow","scroll");
                }

                var qid;
                if(isDrill=="1"){
                    qid=$("#dash_"+oThis.dashId+" #vTab_0 #requete_id").text();
                }else{
                    qid=$("#dash_"+oThis.dashId+" #requete_id").text();
                }
                
                
                if(imgJfree.length>0){
                    oThis.initGraphClick(oThis.dashId,qid);
                }

            }

            $(contentDiv+" form").hide();
            $(contentDiv+" br").hide();

        },
        error:function(xhr,textStatus,errorThrown){
            //alert("NetworkError: "+textStatus+","+errorThrown);
            $("#dialog-box").myLog("show");
            $("#dialog-box").myLog("clear");
            $("#dialog-box").myLog("setTitle","ERROR");
            $("#dialog-box").myLog("err","Error While rendering dashletId:"+oThis.dashId+","+oThis.dashName);
            $("#dialog-box").myLog("err","Network:"+errorThrown);

        }
    });


}

CH.makeHoverButton=function(){
    $(".ui-bar-button").unbind("hover");
    $(".ui-bar-button").hover(
        function(){
            $(this).addClass("ui-state-hover");
        },
        function(){
            $(this).removeClass("ui-state-hover");
        });
};
CH.drillOnItemClick=function(){
    var selector = ".step2 li";
    $(selector).unbind("click");
    $(selector).click(function(){
        selector="."+$(this).prop("class");            
        var s1=$(selector+" .s1").text();
                
        if(s1==="0"){
            $(selector+" .s1").text("1");
            var ht=$(".step2 .allCols "+selector).html();
            $(".step2 .selectedCols").append("<li class='"+$(selector).prop("class")+"'>"+ht+"</li>");
                                
            $(".step2 .allCols "+ selector).remove();
            $(".step2 .selectedCols "+selector+" .ui-icon").removeClass("ui-icon-arrowthick-1-w");
            $(".step2 .selectedCols "+selector+" .ui-icon").addClass("ui-icon-arrowthick-1-e");
            CH.drillOnItemClick();
        }
        else{
                    
            $(".step2 .selectedCols "+ selector+" .s1").text("0");
            var ht=$(".step2 .selectedCols "+selector).html();
            $(".step2 .allCols").append("<li class='"+$(selector).prop("class")+"'>"+ht+"</li>");
                                
            $(".step2 .selectedCols "+ selector).remove();
            $(".step2 .allCols "+selector+" .ui-icon").removeClass("ui-icon-arrowthick-1-e");
            $(".step2 .allCols "+selector+" .ui-icon").addClass("ui-icon-arrowthick-1-w");
            CH.drillOnItemClick();
        }
        CH.jfreeAddMenu(".step2 .selectedCols "+selector);
        CH.makeHoverButton();
    });
};
