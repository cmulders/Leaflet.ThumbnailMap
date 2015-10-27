describe('Leafet.ThumbnailMap', function () {
	describe('options', function () {
		var options;
		beforeEach(function () {
			options = {
				aimingRectOptions: {
					color: '#19ffdd',
					weight: 3
				}
			};
		});
		it('merges the aimingRectOptions and sets the options to the object', function () {
			var control = L.control.thumbnailmap(L.gridLayer(), options);

			expect(control.options.aimingRectOptions).to.be.eql(options.aimingRectOptions);
		});
		it('forces interactive to be false', function () {
			options.aimingRectOptions.interactive = true;
			var control = L.control.thumbnailmap(L.gridLayer(), options);

			expect(control.options.aimingRectOptions.interactive).to.be.false;
		});
	});

	it('can be added to a map', function () {
		var map = L.map(document.createElement('div')).setView([0, 0], 1);
		L.gridLayer().addTo(map);
		L.control.thumbnailmap(L.gridLayer()).addTo(map);
	});

	it('throws if no layer is passed', function () {
		var map = L.map(document.createElement('div')).setView([0, 0], 1);
		L.gridLayer().addTo(map);

		function closure() {
			L.control.thumbnailmap().addTo(map);
		}
		expect(closure).to.throw(Error, 'A layer must be set');
	});

	describe('events', function () {
		var control, map;
		before(function () {
			map = L.map(document.createElement('div')).setView([0, 0], 1);
			L.gridLayer().addTo(map);
			control = L.control.thumbnailmap(L.gridLayer());

			sinon.spy(control, '_onMainMapMoving');
			sinon.spy(control, '_onMainMapMoved');
			sinon.spy(control, '_onMiniMapClicked');
		});
		after(function () {
			control.remove();
			map.remove();
			control = map = undefined;
		});
		afterEach(function () {
			control._onMainMapMoving.reset();
			control._onMainMapMoved.reset();
			control._onMiniMapClicked.reset();
		});
		it('are registered n the main map and the thumbnail map', function () {
			control.addTo(map);

			map.panBy(L.point(10, 10));

			expect(control._onMainMapMoving.calledOnce).to.be.true;
			expect(control._onMainMapMoved.calledOnce).to.be.true;
			expect(control._onMiniMapClicked.called).to.be.false;

			control.getThumbnailMap().fire('click', {latlng: L.latLng([0, 0])});
			expect(control._onMiniMapClicked.called).to.be.true;
		});
		it('are deregistered on the main map and the thumbnail map', function () {
			control.addTo(map);

			map.panBy(L.point(10, 10));
			expect(control._onMainMapMoving.called).to.be.true;
			expect(control._onMainMapMoved.called).to.be.true;

			control._onMainMapMoving.reset();
			control._onMainMapMoved.reset();
			control.remove();

			map.panBy(L.point(10, 10));
			expect(control._onMainMapMoving.called).to.be.false;
			expect(control._onMainMapMoved.called).to.be.false;
		});
	});

	describe('initiates a view', function () {
		var map, container;
		before(function () {
			container = document.createElement('div');
			container.style.width = '100px';
			container.style.height = '100px';
			document.body.appendChild(container);
		});
		after(function () {
			document.body.removeChild(container);
		});
		beforeEach(function () {
			map = L.map(container, {
				crs: L.CRS.Simple
			}).setView([0, 0], 1);

			L.gridLayer().addTo(map);
		});
		afterEach(function () {
			map.remove();
		});
		it('based on the options bounds (regardless of layer bounds)', function () {
			var layer = L.gridLayer({
				bounds: L.latLngBounds([[-5, -5], [5, 5]])
			});
			var control = L.control.thumbnailmap(layer, {
				thumbnailBounds: L.latLngBounds([[-25, -10], [5, 5]])
			}).addTo(map);

			var expectedBounds = L.latLngBounds([[-28.75, -21.25], [8.75, 16.25]]);

			var thumbMap = control.getThumbnailMap();
			expect(thumbMap.getBounds().equals(expectedBounds)).to.be.true;
			expect(thumbMap.getZoom()).to.be.eql(2);

		});
		it('based on the layer bounds', function () {
			var layer = L.gridLayer({
				bounds: L.latLngBounds([[-5, -5], [5, 5]])
			});
			var control = L.control.thumbnailmap(layer).addTo(map);

			var expectedBounds = L.latLngBounds([[-9.375, -9.375], [9.375, 9.375]]);

			var thumbMap = control.getThumbnailMap();
			expect(thumbMap.getBounds().equals(expectedBounds)).to.be.true;
			expect(thumbMap.getZoom()).to.be.eql(3);
		});
		it('that fits the world when no bounds are provided', function () {
			var control = L.control.thumbnailmap(L.gridLayer()).addTo(map);

			var expectedBounds = L.latLngBounds([[-75, -75], [75, 75]]);

			var thumbMap = control.getThumbnailMap();
			expect(thumbMap.getBounds().equals(expectedBounds)).to.be.true;
			expect(thumbMap.getZoom()).to.be.eql(0);
		});
	});

	it('moves the main map when the thumbnail map is clicked', function () {
		var map = L.map(document.createElement('div')).setView([0, 0], 1);
		L.gridLayer().addTo(map);
		var control = L.control.thumbnailmap(L.gridLayer()).addTo(map);

		var destLatLngs = [L.latLng([2, 2]), L.latLng([-2, -2]), L.latLng([-182, -2])];

		destLatLngs.forEach(function (testLatLng) {
			control.getThumbnailMap().fire('click', {latlng: testLatLng});
			expect(map.getCenter().equals(testLatLng)).to.be.true;
		});
	});

	describe('thumbnail map view', function () {
		var map, control;
		before(function () {
			map = L.map(document.createElement('div')).setView([0, 0], 1);
			L.gridLayer().addTo(map);
		});
		beforeEach(function () {
			control = L.control.thumbnailmap(L.gridLayer());
		});
		afterEach(function () {
			if (control) {
				control.remove();
			}
			control = undefined;
		});

		it('can be minimized without toggle button', function () {
			L.setOptions(control, {toggleDisplay: false});
			control.addTo(map);

			control.minimize();
			expect(control.isMinimized()).to.be.true;
			expect(control.getContainer().style.display).to.be.eql('none');
		});
		it('can be restored without toggle button', function () {
			L.setOptions(control, {toggleDisplay: false});
			control.addTo(map);

			control.restore();
			expect(control.isMinimized()).to.be.false;
			expect(control.getContainer().style.display).to.be.eql('block');
		});
		it('can be toggled without toggle button', function () {
			L.setOptions(control, {toggleDisplay: false});
			control.addTo(map);

			control.minimize();
			expect(control.isMinimized()).to.be.true;
			expect(control.getContainer().style.display).to.be.eql('none');

			control.toggleMap();
			expect(control.isMinimized()).to.be.false;
			expect(control.getContainer().style.display).to.be.eql('block');
		});
	});

	describe('toggle button', function () {
		var map, control;
		before(function () {
			map = L.map(document.createElement('div')).setView([0, 0], 1);
			L.gridLayer().addTo(map);
		});
		beforeEach(function () {
			control = L.control.thumbnailmap(L.gridLayer());
		});
		afterEach(function () {
			if (control) {
				control.remove();
			}
			control = undefined;
		});
		it('is only created with the option toggleDisplay', function () {
			L.setOptions(control, {toggleDisplay: false});
			control.addTo(map);
			expect(control._toggleDisplayButton).to.be.undefined;

			control.remove();

			L.setOptions(control, {toggleDisplay: true});
			control.addTo(map);
			expect(control._toggleDisplayButton).to.be.defined;
		});
		it('toggles the map if clicked', function () {
			L.setOptions(control, {width: 100, height: 100, toggleDisplay: true});
			control.addTo(map);
			var button = control._toggleDisplayButton;

			control.minimize();
			expect(control.isMinimized()).to.be.true;

			button.dispatchEvent(new CustomEvent('click'));
			expect(control.isMinimized()).to.be.false;

			button.dispatchEvent(new CustomEvent('click'));
			expect(control.isMinimized()).to.be.true;
		});
	});

	describe('auto toggle', function () {
		var map, container;
		before(function () {
			container = document.createElement('div');
			container.style.width = '100px';
			container.style.height = '100px';
			document.body.appendChild(container);
		});
		after(function () {
			document.body.removeChild(container);
		});
		beforeEach(function () {
			map = L.map(container, {
				crs: L.CRS.Simple
			}).setView([0, 0], 1);

			L.gridLayer().addTo(map);
		});
		afterEach(function () {
			map.remove();
		});
		it('hides the map when the main map view is not in the thumbnail map view', function () {
			map.fitBounds(L.latLngBounds([[10, 10], [5, 5]]));

			var control = L.control.thumbnailmap(L.gridLayer(), {
				thumbnailBounds: L.latLngBounds([[-10, -10], [-5, -5]]),
				autoToggleDisplay: true
			}).addTo(map);

			expect(control.isMinimized()).to.be.true;
		});
		it('shows the map when the main map view is present in the thumbnail map view', function () {
			map.fitBounds(L.latLngBounds([[-6, -6], [-3, -3]]));

			var control = L.control.thumbnailmap(L.gridLayer(), {
				thumbnailBounds: L.latLngBounds([[-50, -50], [50, 50]]),
				autoToggleDisplay: true
			}).addTo(map);

			expect(control.isMinimized()).to.be.false;
		});
		it('hides the map when the main map view is larger than the thumbnail map view', function () {
			map.fitBounds(L.latLngBounds([[-20, -20], [5, 5]]));

			var control = L.control.thumbnailmap(L.gridLayer(), {
				thumbnailBounds: L.latLngBounds([[-10, -10], [-5, -5]]),
				autoToggleDisplay: true
			}).addTo(map);

			expect(control.isMinimized()).to.be.true;
		});
	});
});
