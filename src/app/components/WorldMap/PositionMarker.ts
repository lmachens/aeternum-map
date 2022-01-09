import leaflet from 'leaflet';

class PositionMarker extends leaflet.Marker {
  declare rotation: number;
  private _icon: HTMLElement | undefined = undefined;

  _setPos(pos: leaflet.Point): void {
    if (!this._icon) {
      return;
    }
    if (this._icon.style.transform) {
      this._icon.style.transition = 'transform 1s linear';
    }

    this._icon.style.transformOrigin = 'center';
    this._icon.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) rotate(${this.rotation}deg)`;
    return;
  }
}

export default PositionMarker;
