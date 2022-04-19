import leaflet from 'leaflet';

const RendererGradient = leaflet.Canvas.extend({
  _updatePoly: function (layer) {
    if (!this._drawing) {
      return;
    }

    let i,
      j,
      len2,
      p,
      parts = layer._parts,
      len = parts.length,
      ctx = this._ctx;

    if (!len) {
      return;
    }

    ctx.beginPath();

    let currentColor = layer.options.color;
    for (i = 0; i < len; i++) {
      for (j = 0, len2 = parts[i].length; j < len2; j++) {
        p = parts[i][j];
        ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
        if (layer._colorParts[j]) {
          if (j > 0) {
            this._fillStroke(ctx, layer, currentColor);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }
          currentColor = layer._colorParts[j];
        }
      }
      if (closed) {
        ctx.closePath();
      }
    }
    this._fillStroke(ctx, layer, currentColor);
  },
  _fillStroke: function (ctx, layer, color) {
    const options = layer.options;
    if (options.fill) {
      ctx.globalAlpha = options.fillOpacity;
      ctx.fillStyle = options.fillColor || color || layer.options.color;
      ctx.fill(options.fillRule || 'evenodd');
    }

    if (options.stroke && options.weight !== 0) {
      if (ctx.setLineDash) {
        ctx.setLineDash((layer.options && layer.options._dashArray) || []);
      }
      ctx.globalAlpha = options.opacity;
      ctx.lineWidth = options.weight;
      ctx.strokeStyle = color || layer.options.color;
      ctx.lineCap = options.lineCap;
      ctx.lineJoin = options.lineJoin;
      ctx.stroke();
    }
  },
});

leaflet.Polyline = leaflet.Polyline.extend({
  initialize: function (latlngs, options) {
    leaflet.Util.setOptions(this, options);
    this.options.renderer = new RendererGradient();

    this._setLatLngs(latlngs);
    this._colorParts = [];
  },
});

leaflet.polyline = (
  latlngs: leaflet.LatLngExpression[] | leaflet.LatLngExpression[][],
  options?: leaflet.PolylineOptions | undefined
) => new leaflet.Polyline(latlngs, options);
