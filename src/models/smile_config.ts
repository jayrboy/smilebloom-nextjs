import mongoose from 'mongoose';

const smileConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'home',
      trim: true,
    },
    navLabel: { type: String, trim: true },
    loginLabel: { type: String, trim: true },
    heroTitle: { type: String, trim: true },
    heroSubtitle: { type: String, trim: true },
    introTitle: { type: String, trim: true },
    featureTitle: { type: String, trim: true },
    features: { type: [String], default: [] },
    heroOverlayFrom: { type: String, trim: true },
    heroOverlayVia: { type: String, trim: true },
    heroOverlayTo: { type: String, trim: true },
    pageBackground: { type: String, trim: true },
    featureBoxColor: { type: String, trim: true },
    menuBackgroundColor: { type: String, trim: true },
    menuTextColor: { type: String, trim: true },
    imageSrc: { type: String, trim: true },
    imageAlt: { type: String, trim: true },
  },
  { timestamps: true, collection: 'smile_config' }
);

const SmileConfig =
  mongoose.models.SmileConfig || mongoose.model('SmileConfig', smileConfigSchema);

export default SmileConfig;
