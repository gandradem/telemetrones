window.addEvent('domready', function() {
    
    document.ondragstart = function () { return false; }; //IE hack
    
    var drop = $('wrapper');
    var drop_zones = [$('zone_1'), $('zone_2'), $('zone_3'), $('zone_4'), $('zone_5')];
    var dragable = $('dragable_item');
    var telemetron_form = $('telemetron_form');

    var controller = {
	    dropZone: drop,
	    currentZoneId: 0,
	    jsonData: undefined,
	    imagesPath: 'images/',
	    normalizeCoordinates: function(coordinates) {
	        var normalizedCoords = {
	            top: coordinates.top - drop.getCoordinates().top,
	            left: coordinates.left - drop.getCoordinates().left
	        };
	        return normalizedCoords;
	    },
	    createTelemetron: function(telemetron_id, zone_id, x, y, color, nombre) {
	        var telemetron_obj = {
	            telemetron_id: telemetron_id,
	            zone_id: zone_id,
	            'x': x,
	            'y': y,
	            state: color,
	            name: nombre
	        };
	        return telemetron_obj;
	    },
	    setFormHiddenValues: function(telemetron_obj) {
            $('zone_id').value = telemetron_obj.zone_id;
            $('x').value       = telemetron_obj.x;
            $('y').value       = telemetron_obj.y;
	    },
	    setFormValues: function(telemetron_obj) {
	        $('telemetron_id').value = telemetron_obj.telemetron_id;
	        $('name_input').value = telemetron_obj.name;
	    },
	    prepareForm: function(telemetron_obj, action) {
            $('form_action').value = action;
            this.setFormHiddenValues(telemetron_obj);
            this.setFormValues(telemetron_obj);
            this.updateZoneTextInForm();
	    },
	    dropTelemetronCallBack: function(coordinates) {
	        this.prepareForm(this.createTelemetron(
	            0,
	            this.currentZoneId,
	            coordinates.left,
	            coordinates.top,
	            1,
	            ''
	        ), 'create');
	    },
	    injectTelemetron: function(coordinates, element, dropzone) {
	            if (element) {
                    element.setStyles({'opacity': 1, 'position': 'absolute'})
                    .setStyles(coordinates)
                    .inject(dropzone);
                }
	    },
	    setCurrentZoneId: function(zone_id) {
            //console.debug('setting zone ' + zone_id);
            this.currentZoneId = zone_id;
            // this.changeZoneView(zone_id);
	    },
	    getCurrentZoneName: function() {
            return this.zoneIdToName(this.currentZoneId);
	    },
	    zoneIdToName: function(zone_id) {
	        var zone_name;
	        switch (this.currentZoneId) {
            case 1:
              zone_name = "Hermosillo";
              break;            
            case 2:
              zone_name = "Chihuahua";
              break;
            case 3:
              zone_name = "Monterrey";
              break;
            case 4:
              zone_name = "Centro";
              break;
            case 5:
              zone_name = "Guadalajara";
              break;
            default:
              
            }
            return zone_name; 
	    }, 
	    changeZoneView: function(zoneId) {
	        drop.set('class', 'zone'+zoneId);
	    }, 
	    updateZoneTextInForm: function() {
	        $('zone_text').set('text', 'Zona: ' + this.getCurrentZoneName());
	    },
	    toggleCurrentZone: function() {
	        this.getCurrentZoneElement().toggle();
	    },
	    getCurrentZoneElement: function() {
	        return this.zoneElementById(this.currentZoneId);
	    },
	    zoneElementById: function(zoneId) {
            return $('zone_'+zoneId);
	    },
	    requestData: function() {
            var request = new Request.JSON({
        		url: 'data/data.json',
        		method: 'get',
        		onSuccess: function(responseJSON, responseText) {
                    controller.setJsonData(responseJSON);
                    controller.renderTelemetrones();
        		}
        	}).send();
	    },
	    setJsonData: function(data) {
	        this.jsonData = data;
	    },
	    insertTelemetronElement: function(telemetron_obj) {
	        var html_image = new Element('img', {
                'src': this.telemetronStateToPath(telemetron_obj.state),
                'id': telemetron_obj.telemetron_id,
                'class': 'telemetron',
                'styles': {
                    'position': 'relative',
                    'top': telemetron_obj.y+"px",
                    'left': telemetron_obj.x+"px"
                },
                'events': {
                    'click': function(){
                        controller.prepareForm(this.retrieve('telemetron_obj'),'edit');
                        houdini.toggle_form();
                    },
                    'mouseover': function(){
                        // this.retrieve('tooltip').show();
                    }
                }
            });
            html_image.store('tooltip', new Tips(html_image, {
                className: 'tooltip'
            }));
            html_image.store('tip:title', this.craftTelemetronTipTitle(telemetron_obj));
            html_image.store('tip:text', 'Info: ');
            html_image.store('telemetron_obj', telemetron_obj);
            html_image.inject(this.zoneElementById(telemetron_obj.zone_id));
	    },
        craftTelemetronTipTitle: function(telemetron_obj) {
            var title = 'Telemetron: ' + telemetron_obj.name +
                " Id: " + telemetron_obj.telemetron_id;
            return title;
        },
        craftTelemetronTipText: function(telemetron_obj) {
            //TODO not implemented
            // var text = 'Info: ' + telemetron_obj.name +
            //     " Id: " + telemetron_obj.telemetron_id;
            // return text;
        },
	    renderTelemetrones: function() {
            var telemetrones = this.jsonData.telemetrones;
            telemetrones.each(function(item, index){
                var telemetron_obj = controller.createTelemetronFromJSON(item);
                controller.insertTelemetronElement(telemetron_obj);
	        });

	    },
	    createTelemetronFromJSON: function(obj) {
	        var telemetron_obj = this.createTelemetron(
	            obj.id,
	            obj.idDivision,
	            obj.x,
	            obj.y,
	            +obj.color,
	            obj.nombre
	        );
	        return telemetron_obj;
	    },
	    telemetronStateToPath: function(state) {
	        var path = this.imagesPath;
	        switch(state) {
	            case 1://verde
	                path += 't_red.png';
	                break;
                case 2://amarillo
                    path += 't_yellow.png';
                    break;
                case 3://rojo
                    path += 't_green.png';
                    break;
                default:
	        }
	        return path;
	    },
	    clearAll: function() {
	        for (var i=1; i <= 5; i++) {
	            var element = this.zoneElementById(i);
	            element.getChildren().each(function(item, index){
                    item.destroy();
	            });
	        }
	    }
	};
	
    dragable.addEvent('mousedown', function(e) {
        e.stop();
        
        var clone = this.clone()
        .setStyles(this.getCoordinates())
        .setStyles({'opacity': 0.7, 'position': 'absolute'})
        .inject(document.body);

        var drag = clone.makeDraggable({
            droppables: drop_zones,
            includeMargins: false,
            onComplete: function() {
                this.detach();
            },
            onEnter: function(el, over) {},
            onLeave: function(el, over) {},
            onDrop: function(el, over) {
                if(over) {//over is not a good name
                    controller.dropTelemetronCallBack(clone.getCoordinates(over));
                    clone.id = 'new_telemetron';
                    houdini.toggle_form();
                }
                // clone.dispose();
            },
            onCancel: function() {
                // console.debug('onCancel');
                clone.destroy();
            }
        });

        drag.start(e);
    });
    
    // form stuff
    $('telemetron_form').addEvent('submit', function(e) {
		e.stop();
		var log = $('log_res').empty().addClass('ajax-loading');
		//Set the options of the form's Request handler. 
		//("this" refers to the $('telemetron_form') element).
		this.set('send', {
		    onComplete: function(response) { 
			    log.removeClass('ajax-loading');
			    log.set('html', response);
			    (function(){ 
			        houdini.toggle_form();
			    }).delay(3000);
		    }
		});
		//Send the form.
		this.send();
	});
    $('canceler').addEvent('click', function(e) {
        e.stop();
        if ($('new_telemetron') && 
            ($('form_action').value == 'create')) {
            $('new_telemetron').destroy();
        }
        houdini.toggle_form();
    });
    $('delete').addEvent('click', function(e) {
        $('form_action').value = 'delete';
        $($('telemetron_id').value).destroy();
        // e.target.destroy();
        // console.debug(e);
    });
    
    // houdini hack, nada por aqui nada por alla
	var houdini = {
	    current_mask: undefined,
	    toggle_form: function() {
            // console.debug('*toggle_form*');
	        var form_container = $('form_wrapper');
			if (form_container.getSize().y > 100) {
			    form_container.set('tween', {
			        duration: 1000
			    }).tween('height', '0px');
			    $('form_box').hide();
			    $('log').hide();
                $('delete').hide();
			    (function(){ 
			        houdini.unMask();
			    }).delay(2000);
	    
            }else {
                this.maskElement($('wrapper'));
                form_container.set('tween', {
                    duration: 1000
                }).tween('height', '350px');
			    (function(){ 
			        if ($('form_action').value == 'edit') {			            
    			        $('delete').show();
			        }
			        $('form_box').show();
			        $('log').show();
			    }).delay(1000);
			}
	    },
	    maskElement: function(element) {
            // console.debug('*maskElement*');
            this.current_mask = new Mask(element, {
                destroyOnHide: true,
                hideOnClick: true
            });
            this.current_mask.show();
	    },
	    unMask: function() {
	        if (this.current_mask) {
	            this.current_mask.destroy();
            }//voulea
	    }
	};
	// end houdini hack
	
	//links to change zone stuff
	// TODO: don't make functions within a loop
	for (var i = 0; i <= 5; i++) {
	   $("zone_"+i+"_link").addEvent('click', function() {
           var index = this.id.substring(
               this.id.indexOf("_") + 1, this.id.indexOf("_") + 2);
           controller.toggleCurrentZone();
           controller.setCurrentZoneId(parseInt(index, 10));
           controller.toggleCurrentZone();
       });
	}
	
	if ($defined($('clear_link'))) {
    	$('clear_link').addEvent('click', function(e) {
            controller.clearAll();
        });
    }

    if ($defined($('request_link'))) {
        $('request_link').addEvent('click', function(e) {
            controller.clearAll();
            controller.requestData();
        });
    }
	
	controller.requestData();
});