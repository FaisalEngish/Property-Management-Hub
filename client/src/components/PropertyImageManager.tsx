import { useState, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { invalidateOnMutation } from "@/lib/cacheManager";
import { ImagePlus, Trash2, Home, X, ChevronLeft, ChevronRight, Maximize2, Loader2 } from "lucide-react";

interface PropertyImageManagerProps {
  propertyId: number;
  images: string[];
  isLocalProperty: boolean;
}

const IMAGES_PER_PAGE = 12;
const GRID_COLUMNS = 4;

export default function PropertyImageManager({
  propertyId,
  images = [],
  isLocalProperty,
}: PropertyImageManagerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`/api/property-images/${propertyId}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload images");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Images Uploaded",
        description: data.message || "Images uploaded successfully",
      });
      // Use cache manager for comprehensive invalidation
      await invalidateOnMutation(queryClient, 'property');
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetch(`/api/property-images/${propertyId}/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete image");
      }

      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Image Deleted",
        description: "Image removed successfully",
      });
      // Use cache manager for comprehensive invalidation
      await invalidateOnMutation(queryClient, 'property');
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const MAX_IMAGES = 50;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      const currentCount = validImages.length;
      
      if (currentCount + filesArray.length > MAX_IMAGES) {
        toast({
          title: "Too Many Images",
          description: `Cannot upload ${filesArray.length} images. You have ${currentCount} images and the maximum is ${MAX_IMAGES}.`,
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      for (const file of filesArray) {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds the 10MB limit.`,
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setUploading(true);
      uploadMutation.mutate(filesArray);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validImages = useMemo(() => {
    return images.filter((img) => {
      if (!img || typeof img !== "string" || img.trim() === "") return false;
      if (img.startsWith("file:///") || img.startsWith("file://")) return false;
      if (img.match(/^[A-Z]:\\/i)) return false;
      return img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/");
    });
  }, [images]);

  const totalPages = Math.ceil(validImages.length / IMAGES_PER_PAGE);
  
  const visibleImages = useMemo(() => {
    if (showAllImages) {
      return validImages;
    }
    const startIndex = currentPage * IMAGES_PER_PAGE;
    return validImages.slice(startIndex, startIndex + IMAGES_PER_PAGE);
  }, [validImages, currentPage, showAllImages]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentPage(value[0]);
  };

  const handleLoadMore = () => {
    setShowAllImages(true);
  };

  const handleShowLess = () => {
    setShowAllImages(false);
    setCurrentPage(0);
  };

  const handleDeleteImage = (imageUrl: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(imageUrl);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const hasPagination = validImages.length > IMAGES_PER_PAGE;
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const renderImageGrid = (imagesToRender: string[], showDeleteButtons: boolean) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {imagesToRender.map((img, index) => (
        <div
          key={`${img}-${index}`}
          className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all duration-200"
          onClick={() => handleImageClick(img)}
          data-testid={`image-thumbnail-${index}`}
        >
          <img
            src={img}
            alt={`Property image ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          
          <button
            onClick={(e) => { e.stopPropagation(); handleImageClick(img); }}
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
            data-testid={`button-zoom-${index}`}
            title="View fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {showDeleteButtons && isLocalProperty && (
            <button
              onClick={(e) => handleDeleteImage(img, e)}
              className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
              data-testid={`button-delete-${index}`}
              title="Delete image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {(showAllImages ? index : currentPage * IMAGES_PER_PAGE + index) + 1}
          </div>
        </div>
      ))}
    </div>
  );

  if (!isLocalProperty) {
    if (validImages.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <Home className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No images available</p>
              <p className="text-sm text-slate-400 mt-2">
                Images are managed through the external platform
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Images ({validImages.length})
            </div>
            {hasPagination && !showAllImages && (
              <div className="text-sm text-slate-500">
                Page {currentPage + 1} of {totalPages}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderImageGrid(visibleImages, false)}

          {hasPagination && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {!showAllImages ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={!canGoPrev}
                      className="flex items-center gap-2"
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex-1 max-w-xs px-4">
                      <Slider
                        value={[currentPage]}
                        min={0}
                        max={totalPages - 1}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                        data-testid="slider-page-navigation"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!canGoNext}
                      className="flex items-center gap-2"
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={handleLoadMore}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      data-testid="button-load-more"
                    >
                      Load More... ({validImages.length} total images)
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={handleShowLess}
                    className="text-slate-600 hover:text-slate-700"
                    data-testid="button-show-less"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Images ({validImages.length} / {MAX_IMAGES})
            </div>
            <div className="flex items-center gap-3">
              {hasPagination && !showAllImages && (
                <span className="text-sm text-slate-500">
                  Page {currentPage + 1} of {totalPages}
                </span>
              )}
              <Button
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-upload-images"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4" />
                    Upload Images
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/tiff,.jpg,.jpeg,.png,.webp,.tiff,.tif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-image-upload"
          />

          {validImages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300"
              onClick={handleUploadClick}
            >
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Home className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">No images uploaded yet</p>
              <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
                Click here or use the button above to upload your property images
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span>JPG, PNG, WebP, TIFF</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Max 50 images</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>10MB each</span>
              </div>
            </div>
          ) : (
            <>
              {renderImageGrid(visibleImages, true)}

              {hasPagination && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {!showAllImages ? (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={!canGoPrev}
                          className="flex items-center gap-2"
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>

                        <div className="flex-1 max-w-xs px-4">
                          <Slider
                            value={[currentPage]}
                            min={0}
                            max={totalPages - 1}
                            step={1}
                            onValueChange={handleSliderChange}
                            className="cursor-pointer"
                            data-testid="slider-page-navigation"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!canGoNext}
                          className="flex items-center gap-2"
                          data-testid="button-next-page"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          onClick={handleLoadMore}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          data-testid="button-load-more"
                        >
                          Load More... ({validImages.length} total images)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={handleShowLess}
                        className="text-slate-600 hover:text-slate-700"
                        data-testid="button-show-less"
                      >
                        Show Less
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!hasPagination && validImages.length < MAX_IMAGES && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="flex items-center gap-2"
                    data-testid="button-add-more"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add More Images
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setLightboxImage(null)}
            data-testid="button-close-lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-white text-lg font-semibold">
              {validImages.indexOf(lightboxImage) + 1} / {validImages.length}
            </span>
          </div>

          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = validImages.indexOf(lightboxImage);
                  const prevIndex = currentIndex === 0 ? validImages.length - 1 : currentIndex - 1;
                  setLightboxImage(validImages[prevIndex]);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all"
                data-testid="button-lightbox-prev"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = validImages.indexOf(lightboxImage);
                  const nextIndex = currentIndex === validImages.length - 1 ? 0 : currentIndex + 1;
                  setLightboxImage(validImages[nextIndex]);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all"
                data-testid="button-lightbox-next"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <img
            src={lightboxImage}
            alt="Property image fullscreen"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
