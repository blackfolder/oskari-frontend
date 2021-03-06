/**
 * @class Oskari.mapframework.bundle.myplaces3.view.CategoryForm
 *
 * Shows a form for a myplaces category
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.myplaces3.view.CategoryForm',

    /**
     * @static @method create called automatically on construction
     *
     *
     */
    function (instance) {
        this.instance = instance;
        this.visualizationForm = Oskari.clazz.create('Oskari.userinterface.component.VisualizationForm');

        var loc = Oskari.getMsg.bind(null, 'MyPlaces3');

        this.template = jQuery(
            '<div class="myplacescategoryform">' +
            '  <div class="field">' +
            '    <label for="categoryname">' + loc('categoryform.name.label') + '</label><br clear="all" />' +
            '    <input type="text" data-name="categoryname" placeholder="' + loc('categoryform.name.placeholder') + '"/>' +
            '  </div>' +
            '  <div class="field drawing">' +
            '    <label>' + loc('categoryform.drawing.label') + '</label><br clear="all" />' +
            '    <div class="rendering"></div>' +
            '  </div>' +
            // Currently visible fields are not saved or used in any way so commenting out the UI for now
            /*            '<div class="field visibleFields">' +
            '<label>' + loc('categoryform.visibleFields.label') + '</label><br clear="all" />' +
            '<input type="checkbox" name="placename" checked="checked" />' + loc('categoryform.visibleFields.placename') + '<br/>' +
            '<input type="checkbox" name="placedesc" checked="checked" />' + loc('categoryform.visibleFields.placedesc') + '<br/>' +
            '<input type="checkbox" name="image" checked="checked" />' + loc('categoryform.visibleFields.image') + '<br/>' +
            '</div>' + */
            '</div>'
        );
        this.templateTableRow = jQuery('<tr></tr>');
        this.templateTableCell = jQuery('<td></td>');
        this.templateTextInput = jQuery('<input type="text"/>');
        this.categoryId = undefined;
        this._isDefault = undefined;
    }, {
        start: function () {},
        /**
         * @method getForm
         * @return {jQuery} jquery reference for the form
         */
        getForm: function () {
            var ui = this.template.clone();
            // populate the rendering fields
            var content = ui.find('div.rendering');
            content.append(this.visualizationForm.getForm());

            return ui;
        },

        /**
         * @method getValues
         * Returns form values as an object
         * @return {Object}
         */
        getValues: function () {
            // Mappings
            var values = {};
            // infobox will make us lose our reference so search
            // from document using the form-class
            var onScreenForm = this._getOnScreenForm();

            if (onScreenForm.length > 0) {
                // found form on screen
                values.name = onScreenForm.find('input[data-name=categoryname]').val();
                if (this.categoryId) {
                    values.id = this.categoryId;
                }
                values._isDefault = this._isDefault || false;

                var formValues = this.visualizationForm.getValues();
                values.dot = formValues.dot;
                values.line = formValues.line;
                values.area = formValues.area;

                // Get the names of the fields the user has checked.
                values.visibleFields = [];
                onScreenForm.find('div.visibleFields').find('input[type=checkbox]:checked').each(function () {
                    values.visibleFields.push(this.name);
                });
            }

            return values;
        },
        /**
         * @method setValues
         * Sets form values from object.
         * @param {Object} data place data as formatted in #getValues()
         */
        setValues: function (data) {
            this.categoryId = data.id;
            this._isDefault = data._isDefault;
            // infobox will make us lose our reference so search
            // from document using the form-class
            var onScreenForm = this._getOnScreenForm();

            if (onScreenForm.length > 0) {
                // found form on screen
                this._checkVisibleFields(onScreenForm, data.visibleFields);
            }

            this.visualizationForm.setValues(data);
        },

        /**
         * @method _getOnScreenForm
         * Returns reference to the on screen version shown by OpenLayers
         * @private
         */
        _getOnScreenForm: function () {
            return jQuery('div.myplacescategoryform');
        },

        _checkVisibleFields: function (form, fields) {
            form.find('div.visibleFields input[type=checkbox]').each(function (i, elem) {
                elem.prop('checked', false);
                var j,
                    fLen = fields ? fields.length : 0;

                for (j = 0; j < fLen; j += 1) {
                    if (fields[j] === elem.attr('name')) {
                        elem.prop('checked', true);
                    }
                }
            });
        },

        /**
         * @method destroy
         */
        destroy: function () {
            // remember to remove live bindings if any
            // jQuery('div.myplacescategoryform input.oskaricolor').off();
            if (this.dialog) {
                this.dialog.close();
            }
            var onScreenForm = this._getOnScreenForm();
            onScreenForm.remove();
        }
    });
