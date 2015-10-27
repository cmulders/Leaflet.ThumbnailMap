Leaflet.ThumbnailMap
==========
## Description
Leaflet.ThumbnailMap is a simple control plugin that you can drop into your leaflet map, and it will create a small map in the corner which shows a fixed view. The current map view is reflected by the rectangle. This plugin implementation is heavily influenced by [Leaflet.Mini-Map](https://github.com/Norkart/Leaflet-MiniMap), but serves a entirely different purpose. It is focused on images that are viewed with Leaflet instead of whole world maps and therefore a fixed thumbnail of this image is preferred.

## Requirements
- Leaflet 1.0.0-b2 (or later)

## Example
See the [example](http://cmulders.github.io/Leaflet.ThumbnailMap/examples/example.html)

## Compatibility
Should work on all browsers that are supported by Leaflet.

## Usage
```js
var map = L.map('map').setView([51.44, 4.75], 6);

var url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var layer = L.tileLayer(url, {
    maxZoom: 18,
    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// The layer needs to be cloned
var layerCopy = L.tileLayer(url, layer.options)

L.control.thumbnailmap(layerCopy, {
    position: 'bottomright',
    autoToggleDisplay: true,
    toggleDisplay: true,
    thumbnailBounds: L.latLngBounds([[40, -5],[60, 15]])
}).addTo(map);
```

## API
### Creation
Factory                                               | Description
----------------------------------------------------- | --- 
L.control.thumbnailmap(<ILayer> *layer*, *options?* ) | Creates the Thumbnail map control. Needs to be added to a Leaflet map

#### Options
The regular L.Control options can be used and additionally:

Option              | Type           | Default                         | Description
------------------- | -------------- | ------------------------------- | ---
containerClass      | String         | `leaflet-control-thumbnailmap`  | The main CSS class for styling
buttonClass         | String         | `undefined`                     | Secondary CSS class for the toggle button for custom styling
aimingRectOptions   | L.Path style   | `{color: '#29ffde', weight: 2}` | Styling of the rectangle, is extended from the default style, Eg. `{weight: 1}` becomes `{color: '#29ffde', weight: 1}`
toggleDisplay       | Boolean        | `false`                         | Whether the toggle button must be displayed
autoToggleDisplay   | Boolean        | `false`                         | Whether the thumbnail map auto toggles when the main map view is not present or the main view contains the thumbnail map entirely
width               | Number         | `150`                           | Width of the thumbnail map
height              | Number         | `150`                           | Height of the thumbnail map
thumbnailBounds     | L.latLngBounds | `undefined`                     | Bounds to show, otherwise tries to use layer.bounds or it will call `map.fitWorld()`
hideText            | String         | `Hide Map`                      | Hover text of the button when expanded
showText            | String         | `Show Map                       | Hover text of the button when minimized


#### Methods
The regular L.Control methods can be used and additionally:

Method          | Returns     | Description
--------------- | ----------- | ---
getThumbnailMap | Map         | Returns the Leaflet map that is used internally, to change the view for example
isMinimized     | Boolean     | Returns whether the thumbnail map is minimized
toggleMap       | this        | Toggles the map, eg. expands when minimized and minimize when expanded

## License
This software is released under the [MIT licence](http://www.opensource.org/licenses/mit-license.php).

The arrow icon is taken from the [Material Icons Library](https://github.com/google/material-design-icons)
