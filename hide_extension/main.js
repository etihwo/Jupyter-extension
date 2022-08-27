// Adds a button to hide the output part of the currently selected cells

define([
    "require",
    'jquery',
    'base/js/namespace',
    'base/js/events'
], function(
    requirejs,
    $,
    Jupyter,
    events
) {
    "use strict";

    var toggle_selected = function (html_ids, tag) {
        // Find the selected cell
        var cell = Jupyter.notebook.get_selected_cell();
        // Toggle visibility of the output div
        for (let index = 0; index < html_ids.length; index++) {
            const html_id = html_ids[index];
            cell.element.find(html_id).toggle('slow');    
        }
        
		
		// Retrieve tags
		var tags = cell.metadata.tags || [];
		if (tags.indexOf(tag) == -1){
			// Tags is not inside so add it
			tags.push(tag);
			
		}else{
			// Tags is inside so remove it
			tags.splice(tags.indexOf(tag), 1);
		}
		
		// Update tags
		cell.metadata.tags = tags;
    };


    var toggle_selected_output = () => toggle_selected(["div.output"], "remove_output");
    var toggle_selected_input = () => toggle_selected(["div.input"], "remove_input");
    var toggle_selected_cell = () => toggle_selected(["div.input", "div.output"], "remove_cell");


    var update_visibility = function (html_ids, tag) {
        Jupyter.notebook.get_cells().forEach(function(cell) {
			var tags = cell.metadata.tags || [];
			if (tags.indexOf(tag) != -1){
                for (let index = 0; index < html_ids.length; index++) {
                    const html_id = html_ids[index];
                    cell.element.find(html_id).hide();
                }
			}
        })
    };
    


    var update_output_visibility = () => update_visibility (["div.output"], "remove_output")
    var update_input_visibility = () => update_visibility (["div.input"], "remove_input");
    var update_cell_visibility = () => update_visibility (["div.input", "div.output"], "remove_cell");


    var update_prompt_visibility = function (){
        if (Jupyter.notebook.metadata.prompt_visibility){
            $('#zenmodecss').remove();
        }else{
            $('head').append(
                $('<link id="zenmodecss" rel="stylesheet" type="text/css"/>').attr(
                    'href', requirejs.toUrl("./main.css"))
            );
        }
    } 

    var toggle_prompt_visibility = function (){
        Jupyter.notebook.metadata.prompt_visibility = !Jupyter.notebook.metadata.prompt_visibility;
        update_prompt_visibility();
    }

    var load_ipython_extension = function() {

        // Add a button to the toolbar
        $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                help   : 'Toggle selected cell input display',
                icon   : 'fa-chevron-up',
                handler: function() {
                    toggle_selected_input();
                    setTimeout(function() { $('#btn-hide-input').blur(); }, 500);
                }
            }, 'toggle-cell-input-display', 'hide_extension')
        ])).find('.btn').attr('id', 'btn-hide-input');

        $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                help   : 'Toggle selected cell output display',
                icon   : 'fa-chevron-up',
                handler: function() {
                    toggle_selected_output();
                    setTimeout(function() { $('#btn-hide-output').blur(); }, 500);
                }
            }, 'toggle-cell-output-display', 'hide_extension')
        ])).find('.btn').attr('id', 'btn-hide-output');

        $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                help   : 'Toggle selected cell',
                icon   : 'fa-chevron-up',
                handler: function() {
                    toggle_selected_cell();
                    setTimeout(function() { $('#btn-hide-cell').blur(); }, 500);
                }
            }, 'toggle-cell-cell-display', 'hide_extension')
        ])).find('.btn').attr('id', 'btn-hide-cell');

        $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register({
                help   : 'Toggle selected cell',
                icon   : 'fa-bullseye',
                handler: function() {
                    toggle_prompt_visibility();
                    setTimeout(function() { $('#btn-prompt_visibility').blur(); }, 500);
                }
            }, 'toggle-prompt_visibility-display', 'hide_extension')
        ])).find('.btn').attr('id', 'btn-prompt_visibility');

        // Collapse all cells that are marked as hidden
        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            // notebook already loaded. Update directly
            update_output_visibility();
			update_input_visibility();
            update_cell_visibility();
            update_prompt_visibility();
        }
        events.on("notebook_loaded.Notebook", update_output_visibility);
        events.on("notebook_loaded.Notebook", update_input_visibility);
        events.on("notebook_loaded.Notebook", update_cell_visibility);
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});
