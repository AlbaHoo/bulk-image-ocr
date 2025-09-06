import { useEffect, useReducer, useRef } from 'react';

export interface ICoTreatFileReadSignedUrlInfo {
  signedUrl: string;
  expires: number;
  transform?: IImageTransform;
}

export interface ICoTreatFile {
  id: string;
  hasDeidentified: boolean;
}

export enum EImageSizeMode {
  contain,
  cover,
}

export type IRotateDegree = 0 | 90 | 180 | 270;
export type IFlipOption = 1 | -1;

// Transform order matters, always follow this order: rotate -> scaleX -> scaleY
export interface IImageTransform {
  rotate: IRotateDegree;
  scaleX: IFlipOption; // -1 | 1 to indicate flip horizontally
  scaleY: IFlipOption; // -1 | 1 to indicate flip vertical
}

export interface IImageFilter {
  brightness: number;
  contrast: number;
}

export enum ETransformAction {
  rotate90 = 'rotate90',
  rotateNegative90 = 'rotateNegative90',
  flipHorizontal = 'flipHorizontal',
  flipVertical = 'flipVertical',
}
export const defaultImageTransform: IImageTransform = { rotate: 0, scaleX: 1, scaleY: 1 };

export const defaultImageFilter: IImageFilter = { brightness: 1, contrast: 1 };

export function updateImageTransform(
  currentTransform: IImageTransform,
  action: ETransformAction,
): IImageTransform {
  const { rotate, scaleX, scaleY } = currentTransform;

  let currentRotation = rotate ? rotate % 360 : 0;
  if (currentRotation < 0) {
    currentRotation += 360; // Ensure positive rotation
  }

  let currentScaleX = scaleX;
  let currentScaleY = scaleY;

  switch (action) {
    case ETransformAction.rotate90:
      currentRotation = (currentRotation + 90) % 360;
      break;
    case ETransformAction.rotateNegative90:
      currentRotation = (currentRotation - 90) % 360;
      if (currentRotation < 0) {
        currentRotation += 360; // Ensure positive rotation
      }
      break;
    case ETransformAction.flipHorizontal:
      if (currentRotation === 0 || currentRotation === 180) {
        currentScaleX *= -1;
      } else {
        currentScaleY *= -1;
      }
      break;
    case ETransformAction.flipVertical:
      if (currentRotation === 0 || currentRotation === 180) {
        currentScaleY *= -1;
      } else {
        currentScaleX *= -1;
      }
      break;
  }
  return {
    rotate: currentRotation as IRotateDegree,
    scaleX: currentScaleX,
    scaleY: currentScaleY,
  };
}

export function revertImageTransform(currentTransform: IImageTransform): IImageTransform {
  const { rotate, scaleX, scaleY } = currentTransform;

  let revertRotation = rotate ? (-1 * rotate) % 360 : 0;
  if (revertRotation < 0) {
    revertRotation += 360; // Ensure positive rotation
  }

  let revertScaleX = scaleX;
  let revertScaleY = scaleY;
  if (revertRotation === 90 || revertRotation === 270) {
    revertScaleX = scaleY;
    revertScaleY = scaleX;
  }
  return {
    rotate: revertRotation as IRotateDegree,
    scaleX: revertScaleX,
    scaleY: revertScaleY,
  };
}

export const getConfigToFitImageToContainer = (
  imageTransform: IImageTransform,
  container: { width: number; height: number },
  image: { width: number; height: number },
  sizeMode = EImageSizeMode.contain,
) => {
  const { rotate } = imageTransform;

  if (container.width && container.height && image.width && image.height) {
    const { width: conWidth, height: conHeight } = container;
    const { width: imgWidth, height: imgHeight } = image;

    const imageWidth = rotate % 180 === 0 ? imgWidth : imgHeight;
    const imageHeight = rotate % 180 === 0 ? imgHeight : imgWidth;

    const containerRatio = conWidth / conHeight;
    const imageRatio = imageWidth / imageHeight;

    let resizedWidth = imageWidth;
    let resizedHeight = imageHeight;
    let imagePosTop = 0;
    let imagePosLeft = 0;
    let scaleToFit = 1;

    const fitWidth = () => {
      resizedWidth = conWidth;
      resizedHeight = (conWidth / imageWidth) * imageHeight;
    };
    const fitHeight = () => {
      resizedHeight = conHeight;
      resizedWidth = (conHeight / imageHeight) * imageWidth;
    };

    if (sizeMode === EImageSizeMode.contain) {
      if (imageRatio > containerRatio) {
        fitWidth();
      } else {
        fitHeight();
      }
    }
    if (sizeMode === EImageSizeMode.cover) {
      if (imageRatio < containerRatio) {
        fitWidth();
      } else {
        fitHeight();
      }
    }

    // Move image center to container center, image absolute position is left top corner
    imagePosTop = (conHeight - imgHeight) / 2;
    imagePosLeft = (conWidth - imgWidth) / 2;
    scaleToFit = resizedWidth / imageWidth;

    return {
      containerWidth: conWidth,
      containerHeight: conHeight,
      imageWidth,
      imageHeight,
      resizedWidth,
      resizedHeight,
      imagePosTop,
      imagePosLeft,
      scaleToFit,
    };
  }
  return null;
};

const ZOOM_RANGE = [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

function zoomInFrom(scale: number) {
  const max = ZOOM_RANGE[ZOOM_RANGE.length - 1];
  if (scale >= max) {
    return max;
  }
  return (
    ZOOM_RANGE.find((item, index) => {
      const prev = index > 0 ? ZOOM_RANGE[index - 1] : scale;
      return scale >= prev && scale < item;
    }) || max
  );
}

function zoomOutFrom(scale: number) {
  const min = ZOOM_RANGE[0];
  if (scale <= min) {
    return min;
  }
  return (
    ZOOM_RANGE.find((item, index) => {
      const next = index < ZOOM_RANGE.length - 1 ? ZOOM_RANGE[index + 1] : item;
      return next >= scale && item < scale;
    }) || min
  );
}

export enum EToolMode {
  zoom,
  move,
  rotate,
  flip,
  bright,
  contrast,
}

interface IPropTypes {
  toolMode: EToolMode;
  imageURL: string;
  imageNaturalWidthRef: React.MutableRefObject<number>;
  imageNaturalHeightRef: React.MutableRefObject<number>;
  defaultImageTransform?: IImageTransform; // default to none
  isImageLoaded: boolean;
  onScaleChange: (scale: number) => void;
  onBrightnessChange?(brightness: number): void;
  onContrastChange?(contrast: number): void;
}

interface IStateProps {
  scale: number;
  translateY: number;
  translateX: number;
  dragStartX: number;
  dragStartTranslateX: number;
  dragStartY: number;
  dragStartTranslateY: number;
  isDragging: boolean;
  isZoomOut: boolean;
  imageTransform: IImageTransform;
  imageFilter: IImageFilter;
}

enum ActionTypes {
  LOADED_IMAGE = 'LOADED_IMAGE',
  SET_ZOOM_OUT = 'SET_ZOOM_OUT',
  MOVE_IMAGE = 'MOVE_IMAGE',
  START_DRAGGING = 'START_DRAGGING',
  END_DRAGGING = 'END_DRAGGING',
  RESIZE_IMAGE = 'RESIZE_IMAGE',
  ROTATE_OR_FLIP = 'ROTATE_OR_FLIP',
  FILTER_IMAGE = 'FILTER_IMAGE',
}

type Action =
  | {
      type: ActionTypes.LOADED_IMAGE;
      scale: number;
      translateX: number;
      translateY: number;
      imageTransform: IImageTransform;
      imageFilter: IImageFilter;
    }
  | { type: ActionTypes.SET_ZOOM_OUT; isZoomOut: boolean }
  | { type: ActionTypes.MOVE_IMAGE; translateX: number; translateY: number }
  | {
      type: ActionTypes.START_DRAGGING;
      dragStartX: number;
      dragStartTranslateX: number;
      dragStartY: number;
      dragStartTranslateY: number;
    }
  | { type: ActionTypes.END_DRAGGING }
  | { type: ActionTypes.RESIZE_IMAGE; scale: number; translateX: number; translateY: number }
  | { type: ActionTypes.ROTATE_OR_FLIP; imageTransform: IImageTransform }
  | { type: ActionTypes.FILTER_IMAGE; imageFilter: IImageFilter };

function reducer(state: IStateProps, action: Action): IStateProps {
  switch (action.type) {
    case ActionTypes.LOADED_IMAGE:
      return {
        ...state,
        scale: action.scale,
        translateX: action.translateX,
        translateY: action.translateY,
        imageTransform: action.imageTransform,
        imageFilter: action.imageFilter,
      };
    case ActionTypes.SET_ZOOM_OUT:
      return {
        ...state,
        isZoomOut: action.isZoomOut,
      };
    case ActionTypes.MOVE_IMAGE:
      return {
        ...state,
        translateX: action.translateX,
        translateY: action.translateY,
      };
    case ActionTypes.START_DRAGGING:
      return {
        ...state,
        isDragging: true,
        dragStartX: action.dragStartX,
        dragStartTranslateX: action.dragStartTranslateX,
        dragStartY: action.dragStartY,
        dragStartTranslateY: action.dragStartTranslateY,
      };
    case ActionTypes.END_DRAGGING:
      return {
        ...state,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
      };
    case ActionTypes.RESIZE_IMAGE:
      return {
        ...state,
        scale: action.scale,
        translateX: action.translateX,
        translateY: action.translateY,
      };
    case ActionTypes.ROTATE_OR_FLIP:
      return {
        ...state,
        imageTransform: action.imageTransform,
      };
    case ActionTypes.FILTER_IMAGE:
      return {
        ...state,
        imageFilter: action.imageFilter,
      };
  }
}

export default function useImageTransform(props: IPropTypes) {
  const initialState: IStateProps = {
    scale: 0,
    translateY: 0,
    translateX: 0,
    dragStartX: 0,
    dragStartY: 0,
    dragStartTranslateX: 0,
    dragStartTranslateY: 0,
    isDragging: false,
    isZoomOut: false,
    imageTransform: props.defaultImageTransform || defaultImageTransform,
    imageFilter: defaultImageFilter,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    onScaleChange,
    onBrightnessChange,
    onContrastChange,
    toolMode,
    imageNaturalWidthRef,
    imageNaturalHeightRef,
    imageURL,
    isImageLoaded,
  } = props;
  const { scale, translateX, translateY, isDragging, isZoomOut, imageTransform, imageFilter } =
    state;

  const isZoomMode = () => {
    return toolMode === EToolMode.zoom;
  };

  const isMoveMode = () => {
    return toolMode === EToolMode.move;
  };

  const handleWheel = (e) => {
    dispatch({
      type: ActionTypes.MOVE_IMAGE,
      translateX: translateX + parseFloat(e.deltaX) * -1,
      translateY: translateY + parseFloat(e.deltaY) * -1,
    });
  };

  const handleMouseDown = (e) => {
    if (e.target === imageWrapRef.current || imageWrapRef.current?.contains(e.target)) {
      if (isMoveMode()) {
        dispatch({
          type: ActionTypes.START_DRAGGING,
          dragStartX: e.clientX,
          dragStartTranslateX: translateX,
          dragStartY: e.clientY,
          dragStartTranslateY: translateY,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isMoveMode() && isDragging) {
      dispatch({ type: ActionTypes.END_DRAGGING });
    }
  };

  const handleMouseMove = (e) => {
    if (isMoveMode() && isDragging) {
      e.preventDefault();
      const { dragStartX, dragStartY, dragStartTranslateX, dragStartTranslateY } = state;
      dispatch({
        type: ActionTypes.MOVE_IMAGE,
        translateX: dragStartTranslateX + (parseFloat(e.clientX) - dragStartX),
        translateY: dragStartTranslateY + (parseFloat(e.clientY) - dragStartY),
      });
    }
  };

  const zoomToScale = (targetScale: number, centerPoint?: { x: number; y: number }) => {
    const newState = {
      scale: targetScale,
      translateX,
      translateY,
    };
    if (imageWrapRef.current && centerPoint) {
      const zoomCenterX = imageNaturalWidthRef.current / 2 + translateX;
      const zoomCenterY = imageNaturalHeightRef.current / 2 + translateY;
      const offsetX = zoomCenterX - centerPoint.x;
      const offsetY = zoomCenterY - centerPoint.y;
      const afterOffsetX = (offsetX / scale) * targetScale;
      const afterOffsetY = (offsetY / scale) * targetScale;
      newState.translateX = translateX + (afterOffsetX - offsetX);
      newState.translateY = translateY + (afterOffsetY - offsetY);
    }
    dispatch({ type: ActionTypes.RESIZE_IMAGE, ...newState });
    onScaleChange(targetScale);
  };

  const zoomIn = (centerPoint?: { x: number; y: number }) => {
    const targetScale = zoomInFrom(scale);
    zoomToScale(targetScale, centerPoint);
  };

  const getFitToScreenConfg = (rotate = 0, scaleX = 1, scaleY = 1) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerBounding = container.getBoundingClientRect();
      const { width: conWidth, height: conHeight } = containerBounding;
      const config = getConfigToFitImageToContainer(
        { rotate, scaleX, scaleY } as IImageTransform,
        {
          width: conWidth,
          height: conHeight,
        },
        {
          width: imageNaturalWidthRef.current,
          height: imageNaturalHeightRef.current,
        },
      );

      return config;
    }
    return null;
  };

  const zoomToFit = () => {
    const config = getFitToScreenConfg(
      imageTransform.rotate,
      imageTransform.scaleX,
      imageTransform.scaleY,
    );
    if (config) {
      dispatch({
        type: ActionTypes.RESIZE_IMAGE,
        scale: config.scaleToFit,
        translateY: config.imagePosTop,
        translateX: config.imagePosLeft,
      });
      onScaleChange(config.scaleToFit);
    }
  };

  const flipOrRotate = (transformAction: ETransformAction) => {
    const newTransform = updateImageTransform(imageTransform, transformAction);
    dispatch({
      type: ActionTypes.ROTATE_OR_FLIP,
      imageTransform: newTransform,
    });
    return newTransform;
  };

  const fliph = () => flipOrRotate(ETransformAction.flipHorizontal);

  const flipv = () => flipOrRotate(ETransformAction.flipVertical);

  const rotate90 = () => flipOrRotate(ETransformAction.rotate90);

  const rotateNegative90 = () => flipOrRotate(ETransformAction.rotateNegative90);

  const zoomOut = (centerPoint?: { x: number; y: number }) => {
    const targetScale = zoomOutFrom(scale);
    zoomToScale(targetScale, centerPoint);
  };

  const zoomTo100 = () => {
    zoomToScale(1);
  };

  const handleZoomClick = (e) => {
    if (e.currentTarget === containerRef.current) {
      const containerBounding = containerRef.current.getBoundingClientRect();
      const leftBound = containerBounding.left;
      const topBound = containerBounding.top;
      const centerPoint = {
        x: e.nativeEvent.clientX - leftBound,
        y: e.nativeEvent.clientY - topBound,
      };
      if (isZoomOut) {
        zoomOut(centerPoint);
      } else {
        zoomIn(centerPoint);
      }
    }
  };

  const filterByBrightness = (brightness: number) => {
    const newFilter = { ...imageFilter, brightness };
    dispatch({
      type: ActionTypes.FILTER_IMAGE,
      imageFilter: newFilter,
    });
    onBrightnessChange?.(brightness);
    return newFilter;
  };

  const filterByContrast = (contrast: number) => {
    const newFilter = { ...imageFilter, contrast };
    dispatch({
      type: ActionTypes.FILTER_IMAGE,
      imageFilter: newFilter,
    });
    onContrastChange?.(contrast);
    return newFilter;
  };

  function getImageContainerProps() {
    let cursor: string;
    if (isMoveMode()) {
      cursor = isDragging ? 'grabbing' : 'grab';
    } else if (isZoomMode()) {
      cursor = isZoomOut ? 'zoom-out' : 'zoom-in';
    }

    return {
      ref: containerRef,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
      onWheel: handleWheel,
      onClick: isZoomMode() ? handleZoomClick : null,
      style: cursor ? { cursor } : null,
    };
  }

  const getImageWrapProps = () => {
    const scaleX = scale * imageTransform.scaleX;
    const scaleY = scale * imageTransform.scaleY;
    return {
      ref: imageWrapRef,
      style: {
        transform: `
          translate(${translateX}px, ${translateY}px)
          rotate(${imageTransform.rotate}deg)
          scaleX(${scaleX})
          scaleY(${scaleY})
        `,
        transformOrigin: 'center',
        width: imageNaturalWidthRef.current,
        height: imageNaturalHeightRef.current,
      },
    };
  };

  const getImageProps = () => {
    return {
      style: {
        filter: `
          brightness(${imageFilter.brightness})
          contrast(${imageFilter.contrast})
        `,
        backgroundImage: `url(${imageURL})`,
      },
    };
  };

  useEffect(() => {
    const handleOnKeyDown = (e) => {
      if (toolMode === EToolMode.zoom && e.altKey) {
        dispatch({ type: ActionTypes.SET_ZOOM_OUT, isZoomOut: true });
      }
    };
    const handleOnKeyUp = () => {
      if (toolMode === EToolMode.zoom && isZoomOut) {
        dispatch({ type: ActionTypes.SET_ZOOM_OUT, isZoomOut: false });
      }
    };
    window.addEventListener('keydown', handleOnKeyDown);
    window.addEventListener('keyup', handleOnKeyUp);
    return () => {
      window.removeEventListener('keydown', handleOnKeyDown);
      window.removeEventListener('keyup', handleOnKeyUp);
    };
  }, [toolMode, isZoomOut]);

  useEffect(() => {
    // apply the initial original transform from from api server
    const transform = props.defaultImageTransform;
    if (isImageLoaded) {
      const config = getFitToScreenConfg(transform.rotate, transform.scaleX, transform.scaleY);
      dispatch({
        type: ActionTypes.LOADED_IMAGE,
        scale: config.scaleToFit,
        translateY: config.imagePosTop,
        translateX: config.imagePosLeft,
        imageTransform: transform,
        imageFilter: defaultImageFilter,
      });
      onScaleChange(config.scaleToFit);
      onBrightnessChange?.(defaultImageFilter.brightness);
      onContrastChange?.(defaultImageFilter.contrast);
    }
  }, [isImageLoaded, props.defaultImageTransform]);

  return {
    scale,
    imageTransform,
    getImageContainerProps,
    getImageWrapProps,
    getImageProps,
    zoomIn,
    zoomOut,
    zoomTo100,
    zoomToFit,
    fliph,
    flipv,
    rotate90,
    rotateNegative90,
    filterByBrightness,
    filterByContrast,
  };
}
