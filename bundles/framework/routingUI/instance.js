/**
 * @class Oskari.mapframework.bundle.routingUI.RoutingUIBundleInstance
 */
Oskari.clazz.define('Oskari.mapframework.bundle.routingUI.RoutingUIBundleInstance',
/**
 * @static constructor function
 */
function () {
    this.sandbox = null;
    this.started = false;
    this.toolActive = false;
    this.countMapClicked = null;
}, {
    __name: 'routingUI',
    /**
     * @method getName
     * @return {String} the name for the component
     */
    getName: function () {
        return this.__name;
    },
    /**
     * @method getLocalization
     * Returns JSON presentation of bundles localization data for current language.
     * If key-parameter is not given, returns the whole localization data.
     *
     * @param {String} key (optional) if given, returns the value for key
     * @return {String/Object} returns single localization string or
     *      JSON object for complete data depending on localization
     *      structure and if parameter key is given
     */
    getLocalization: function (key) {
        if (!this._localization) {
            this._localization = Oskari.getLocalization(this.getName());
        }
        if (key) {
            return this._localization[key];
        }
        return this._localization;
    },
    /**
     * Registers itself to the sandbox, creates the tab and the service
     * and adds the flyout.
     *
     * @method start
     */
    start: function () {
        var me = this,
            conf = me.conf,
            sandboxName = (conf ? conf.sandbox : null) || 'sandbox',
            sandbox = Oskari.getSandbox(sandboxName),
            request,
            p;

        this.sandbox = sandbox;
        sandbox.register(this);

        for (p in me.eventHandlers) {
            if(me.eventHandlers.hasOwnProperty(p)) {
                me.sandbox.registerForEventByName(me, p);
            }
        }

        this.localization = me.getLocalization();

        // stateful
        if (conf && conf.stateful === true) {
            sandbox.registerAsStateful(this.mediator.bundleId, this);
        }

        this.registerTool();
    },
    /**
     * Requests the tool to be added to the toolbar.
     *
     * @method registerTool
     */
    registerTool: function() {
        var me = this,
            loc = this.getLocalization(),
            sandbox = this.getSandbox(),
            reqBuilder = sandbox.getRequestBuilder('Toolbar.AddToolButtonRequest'),
            request;

        me.popup = Oskari.clazz.create("Oskari.mapframework.bundle.routingUI.PopupRouting", me),

        me.buttonGroup = 'viewtools';
        me.toolName = 'routing';
        me.tool = {
            iconCls: 'tool-feature-selection',
            tooltip: me.localization.tool.tooltip,
            sticky: false,
            callback: function () {
                me.popup.showRoutingPopup();
            }
        };

        if (reqBuilder) {
            request = reqBuilder(this.toolName, this.buttonGroup, this.tool);
            sandbox.request(this, request);
        }
    },

    /**
     * @method onEvent
     * @param {Oskari.mapframework.event.Event} event a Oskari event object
     * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
     */
    onEvent: function (event) {
        var handler = this.eventHandlers[event.getName()];
        if (!handler) {
            return;
        }

        return handler.apply(this, [event]);
    },

    eventHandlers: {
        'MapClickedEvent': function (event) {
            if (!this.toolActive) {
                return;
            }
            if (this.countMapClicked === null) {
                this.countMapClicked += 1;
                this.popup.setStartingPoint(event.getLonLat());
            } else if (this.countMapClicked === 1) {
                this.countMapClicked = null;
                this.popup.setFinishingPoint(event.getLonLat());
            }
        },
        'RouteSuccessEvent': function (event) {
            var geom = event.getGeoJson();
            this.renderRoute(geom);

            var instructions = event.getRouteInstructions();
            this.renderInstructions(instructions);
        }
    },

    renderRoute: function (geom) {
        var me = this,
            rn = 'MapModulePlugin.AddFeaturesToMapRequest',
            style = OpenLayers.Util.applyDefaults(style, OpenLayers.Feature.Vector.style['default']);
        style.strokeColor = '#000000';
        style.cursor = 'pointer';
        style.strokeWidth = 2;
        this.sandbox.postRequestByName(rn, [geom, 'GeoJSON', null, null, 'replace', true, style, false]);
        me.popup.progressSpinner.stop();
    },

    renderInstructions: function (instructions) {
        var me = this;
            loc = me.localization.routeInstructions;


        instructionDiv = '<div><li>' + loc.length + instructions.length + loc.meters + ', ' + loc.duration + instructions.duration + loc.seconds + '</li></div>'
        me.popup.popupContent.append(instructionDiv);
    }
}, {
    "extend": ["Oskari.userinterface.extension.DefaultExtension"]
});
