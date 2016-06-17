;(function (define) {
    'use strict';
    define(['backbone',
            'underscore',
            'jquery',
            'text!common/templates/components/tabbed_view.underscore',
            'text!common/templates/components/tab.underscore',
            'text!common/templates/components/tabpanel.underscore',
           ], function (
               Backbone,
               _,
               $,
               tabbedViewTemplate,
               tabTemplate,
               tabPanelTemplate
           ) {
                var keys = {
                    'left':     37,
                    'right':    39,
                    'down':     40,
                    'up':       38,
                    'enter':    13,
                    'space':    32
                };
               
               var getTabPanelId = function (id) {
                   return 'tabpanel-' + id;
               };

               var TabPanelView = Backbone.View.extend({
                   template: _.template(tabPanelTemplate),

                   initialize: function(options) {
                       this.view = options.view;
                       this.index = options.index;
                   },

                   render: function() {
                       var tabPanelHtml = this.template({
                               tabId: getTabPanelId(this.index),
                               index: this.index
                           });

                       this.setElement($(tabPanelHtml));
                       this.$el.append(this.view.render().el);

                       return this;
                   }
               });

               var TabbedView = Backbone.View.extend({
                   events: {
                       'click .tab': 'switchTab',
                       'keydown .tab': 'keydownHandler'
                   },

                   /**
                    * View for a tabbed interface. Expects a list of tabs
                    * in its options object, each of which should contain the
                    * following properties:
                    *   view (Backbone.View): the view to render for this tab.
                    *   title (string): The title to display for this tab.
                    *   url (string): The URL fragment which will
                    *     navigate to this tab when a router is
                    *     provided.
                    * If a router is passed in (via options.router),
                    * use that router to keep track of history between
                    * tabs.  Backbone.history.start() must be called
                    * by the router's instantiator after this view is
                    * initialized.
                    */
                   initialize: function(options) {
                       this.router = null;
                       this.tabs = options.tabs;
                       this.template = _.template(tabbedViewTemplate)({viewLabel: options.viewLabel});
                       // Convert each view into a TabPanelView
                       _.each(this.tabs, function(tabInfo, index) {
                           tabInfo.view = new TabPanelView({
                               view: tabInfo.view,
                               index: index
                           });
                       }, this);
                   },
                   render: function () {
                       var self = this;
                       
                       this.$el.html(this.template);
                       
                       _.each(this.tabs, function(tabInfo, index) {
                           var tabEl = $(_.template(tabTemplate)({
                                   index: index,
                                   title: tabInfo.title,
                                   tabPanelId: getTabPanelId(index)
                               })),
                               tabContainerEl = this.$('.tabs');
                           self.$('.page-content-nav').append(tabEl);

                           // Render and append the current tab panel
                           tabContainerEl.append(tabInfo.view.render().$el);
                       }, this);
                       // Re-display the default (first) tab if the
                       // current route does not belong to one of the
                       // tabs.  Otherwise continue displaying the tab
                       // corresponding to the current URL.
                       Backbone.history.navigate('');
                       Backbone.history.stop();
                       this.$('.tab:first')
                        .addClass('is-active')
                        .attr({
                            'aria-expanded': 'true',
                            'aria-selected': 'true',
                            'tabindex': '-1'
                        });
                        
                       this.$('.tabpanel:first')
                        .removeClass('is-hidden')
                        .attr({
                            'aria-hidden': 'false'
                        });

                       return this;
                   },

                   setActiveTab: function (index) {
                       var tabMeta = this.getTabMeta(index),
                           tab = tabMeta.tab,
                           tabEl = tabMeta.element,
                           view = tab.view;
                       
                       // Hide old tab/tabpanel
                       this.$('button.is-active')
                        .removeClass('is-active')
                        .attr({
                            'aria-expanded': 'false',
                            'aria-selected': 'false',
                            'tabindex': '-1'
                        });
                       
                       this.$('.tabpanel[aria-hidden="false"]')
                        .addClass('is-hidden')
                        .attr({
                            'aria-hidden': 'true'
                        });
                       
                       // Show new tab/tabpanel
                       tabEl
                        .addClass('is-active')
                        .attr({
                            'aria-expanded': 'true',
                            'aria-selected': 'true',
                            'tabindex': '0'
                        });
                       
                       view.$el
                        .removeClass('is-hidden')
                        .attr({
                            'aria-hidden': 'false',
                        })
                        .focus();
                   },

                   switchTab: function (event) {
                       event.preventDefault();
                       this.setActiveTab($(event.currentTarget).data('index'));
                   },
                   
                   previousTab: function(focused, index, total, event) {
                        var tab, panel;

                        if (event.altKey || event.shiftKey) {
                            return true;
                        }

                        if (index === 0) {
                            tab = $(focused).parent().find('.tab').last();                            
                        } else {
                            tab = $(focused).parent().find('.tab:eq(' + index + ')').prev();
                        }

                        panel = $(tab).data('index');

                        tab.focus();

                        return false;
                   },
                   
                   nextTab: function(focused, index, total, event) {
                       var tab, panel;

                       if (event.altKey || event.shiftKey) {
                           return true;
                       }

                       if (index === total) {
                           tab = $(focused).parent().find('.tab').first();                           
                       } else {
                           tab = $(focused).parent().find('.tab:eq(' + index + ')').next();
                       }

                       panel = $(tab).data('index');

                       tab.focus();
                       
                       return false;
                   },
                   
                   keydownHandler: function(event) {
                       event.preventDefault();

                        var key = event.which,
                            focused = $(event.currentTarget),
                            index = $(focused).parent().find('.tab').index(focused),
                            total = $(focused).parent().find('.tab').size() - 1,
                            tab = $(focused).data('index');
                        
                        switch (key) {
                            case keys.left:
                            case keys.up:
                                this.previousTab(focused, index, total, event);
                                break;
                                
                            case keys.right:
                            case keys.down:
                                this.nextTab(focused, index, total, event);
                                break;
                                
                            case keys.enter:
                            case keys.space:
                                this.setActiveTab(tab);
                                break;
                                
                            default:
                                return true;
                        }
                   },

                   /**
                    * Get the tab by name or index. Returns an object
                    * encapsulating the tab object and its element.
                    */
                   getTabMeta: function (tabNameOrIndex) {
                       var tab, element;
                        
                        tab = this.tabs[tabNameOrIndex];
                        element = this.$('button[data-index='+tabNameOrIndex+']');

                       return {'tab': tab, 'element': element};
                   }
               });
               return TabbedView;
           });
}).call(this, define || RequireJS.define);
