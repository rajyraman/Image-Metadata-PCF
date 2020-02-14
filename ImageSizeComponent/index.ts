/// <reference path="../node_modules/image-size/dist/index.d.ts"
/// <reference path="exif-reader.extended.d.ts"

import { IInputs, IOutputs } from './generated/ManifestTypes';
import ExifReader, { Tags } from 'exifreader';
import { decode } from 'punycode';
export class ImageSizeComponent
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _imageHeight: string;
  private _imageWidth: string;
  private _model: string;
  private _notifyOutputChanged: () => void;
  private _base64Image: string | null;
  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    this._base64Image = context.parameters.imageBase64.raw!;
    this._notifyOutputChanged = notifyOutputChanged;
  }

  private extractExif(base64Image: string) {
    if (base64Image.indexOf('base64') > -1) {
      base64Image = base64Image.substr(base64Image.indexOf('base64,') + 7);
    }
    // Add control initialization code
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0))
      .buffer;
    const tags = ExifReader.load(imageBuffer);
    console.log(tags);
    this._imageWidth = tags['Image Width'].description;
    this._imageHeight = tags['Image Height'].description;
    this._model = tags.Model.description;
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    console.log('update');
    console.log(context.parameters.imageBase64.raw);
    if (context.parameters.imageBase64.raw != this._base64Image) {
      this._base64Image = context.parameters.imageBase64.raw;
      if (this._base64Image) {
        this.extractExif(context.parameters.imageBase64.raw!);
      }
      else {
        this._imageWidth = '';
        this._imageHeight = '';
        this._model = '';
      }
      this._notifyOutputChanged();
    }
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {
      imageSize: this._imageWidth ? `${this._imageWidth},${this._imageHeight}` : '',
      exifModel: this._model
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
