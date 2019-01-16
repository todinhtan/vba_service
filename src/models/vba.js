import mongoose from 'mongoose';

import dateUtils from '../utils/date';

mongoose.Error.messages.general.required = '{PATH} is required';

const VbaSchema = new mongoose.Schema(
  {
    walletId: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'US',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    entityType: {
      type: String,
      enum: {
        values: ['CORP', 'M', 'F'],
        message: 'Invalid entityType, must be one of (CORP, M, F)',
      },
      required: true,
    },
    companyNameCn: {
      type: String,
      trim: true,
      default: '',
    },
    companyNameEn: {
      type: String,
      trim: true,
      default: '',
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    dateOfEstablishment: {
      type: Number,
    },
    beneficialOwners: {
      type: mongoose.Mixed,
      trim: true,
    },
    repAddress: {
      street1: {
        type: String,
        trim: true,
      },
      street2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    entityScope: {
      type: String,
      trim: true,
      enum: {
        values: ['Shopping/Retail'],
        message: 'entityScope must be "Shopping/Retail"',
      },
      required: true,
    },
    ip: {
      type: String,
      trim: true,
      required: true,
    },
    nameCn: {
      type: String,
      trim: true,
      default: '',
      required() { return !this.nameEn; },
    },
    nameEn: {
      type: String,
      trim: true,
      default: '',
      required() { return !this.nameCn; },
    },
    dateOfBirth: {
      type: Number,
      validate: {
        validator(v) {
          const age = dateUtils.calculateAgeFromUnix(v);
          return age >= 18 && age <= 120;
        },
        message: 'Invalid dateOfBirth, age must be between 18 and 120',
      },
      required: true,
    },
    idNumber: {
      type: String,
      trim: true,
      required: true,
    },
    merchantIds: [{
      merchantId: {
        type: String,
        trim: true,
        required: true,
      },
      merchantIdType: {
        type: String,
        trim: true,
        required: true,
      },
      merchantIdCountry: {
        type: String,
        trim: true,
        required: true,
      }
    }],
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street1: {
        type: String,
        trim: true,
        required: true,
      },
      street2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
        required: true,
      },
      state: {
        type: String,
        trim: true,
        required: true,
      },
      postalCode: {
        type: String,
        trim: true,
        required: true,
      },
      country: {
        type: String,
        trim: true,
        required: true,
      },
    },
    expectedMonthlySales: {
      type: String,
      trim: true,
    },
    idDoc: {
      type: String,
      trim: true,
    },
    coiDoc: {
      type: String,
      trim: true,
    },
    salesDoc: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED'],
      default: 'PENDING',
    },
    sessionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_time', updatedAt: 'updated_time' },
  },
);

// custom validators on schema
// eslint-disable-next-line func-names
VbaSchema.path('repAddress.street1').required(function () {
  return this.entityType === 'CORP';
}, 'reqAddress.street1 is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('repAddress.city').required(function () {
  return this.entityType === 'CORP';
}, 'reqAddress.city is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('repAddress.state').required(function () {
  return this.entityType === 'CORP';
}, 'reqAddress.state is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('repAddress.postalCode').required(function () {
  return this.entityType === 'CORP';
}, 'reqAddress.postalCode is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('repAddress.country').required(function () {
  return this.entityType === 'CORP';
}, 'reqAddress.country is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('registrationNumber').required(function () {
  return this.entityType === 'CORP';
}, 'registrationNumber is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('dateOfEstablishment').required(function () {
  return this.entityType === 'CORP';
}, 'dateOfEstablishment is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('companyNameCn').required(function () {
  return this.entityType === 'CORP' && !this.companyNameEn;
}, 'companyNameCn or companyNameEn is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('companyNameEn').required(function () {
  return this.entityType === 'CORP' && !this.companyNameCn;
}, 'companyNameCn or companyNameEn is required for CORP');

// eslint-disable-next-line func-names
VbaSchema.path('beneficialOwners').required(function () {
  return this.entityType === 'CORP' && this.country === 'HK';
}, 'beneficialOwners is required for CORP and country HK');

// eslint-disable-next-line func-names
VbaSchema.path('nameCn').required(function () {
  return !this.nameEn;
}, 'nameCn or nameEn is required');

// eslint-disable-next-line func-names
VbaSchema.path('nameEn').required(function () {
  return !this.nameCn;
}, 'nameCn or nameEn is required');

// index
VbaSchema.index({ walletId: 1 });
VbaSchema.index({ walletId: 1, country: 1 }, { unique: true });

export default mongoose.model('VbaRequest', VbaSchema);
