import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { MOCK_PRODUCTS } from '../src/lib/mock-data';

// Firebase Client SDK 초기화 (Admin SDK 불필요)
const firebaseConfig = {
  apiKey: "AIzaSyBniRDTvu-VyRsrRjZ7tABCJPPMcS0w9yk",
  authDomain: "myaiprintshop.firebaseapp.com",
  projectId: "myaiprintshop",
  storageBucket: "myaiprintshop.firebasestorage.app",
  messagingSenderId: "436157113796",
  appId: "1:436157113796:web:0f1c03b91632a5e0aff091",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock 데이터를 Firestore 포맷으로 변환
function convertMockToFirestore(mock: typeof MOCK_PRODUCTS[0]) {
  return {
    name: mock.name,
    price: mock.price,
    originalPrice: mock.originalPrice || null,
    thumbnail: mock.thumbnail,
    images: [mock.thumbnail],
    category: mock.category,
    subcategory: null,
    badge: mock.badge || null,
    tags: ['AI 커스텀', '인기상품'],
    options: {
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1E3A5F' },
      ],
      groups: [
        {
          id: 'opt_material',
          name: 'Material',
          label: '소재',
          type: 'select',
          required: true,
          values: [
            { id: 'v1', label: '기본', priceAdded: 0 },
            { id: 'v2', label: '프리미엄', priceAdded: 3000 },
          ],
        },
      ],
    },
    stock: 100,
    isActive: true,
    reviewCount: mock.reviewCount,
    rating: mock.rating,
    volumePricing: [
      { minQuantity: 10, discountRate: 0.1 },
      { minQuantity: 50, discountRate: 0.2 },
      { minQuantity: 100, discountRate: 0.3 },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

async function seedProducts() {
  console.log('Starting Firestore seeding...\n');

  const productsRef = collection(db, 'products');

  // 기존 데이터 확인
  const snapshot = await getDocs(productsRef);
  if (!snapshot.empty) {
    console.warn(`Warning: products collection already has ${snapshot.size} documents.`);
    console.log('Continuing will add/update products with the same IDs.\n');
  }

  let successCount = 0;
  let errorCount = 0;

  for (const mock of MOCK_PRODUCTS) {
    try {
      const data = convertMockToFirestore(mock);
      const docRef = doc(db, 'products', mock.id);
      await setDoc(docRef, data);
      console.log(`+ Added product: ${mock.id.padEnd(4)} - ${mock.name}`);
      successCount++;
    } catch (error) {
      console.error(`x Failed to add product: ${mock.id}`, error);
      errorCount++;
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`Success: ${successCount}`);
  console.log(`Errors:  ${errorCount}`);
  console.log(`Total:   ${MOCK_PRODUCTS.length}`);
  console.log('\nFirestore database is now ready!');
  console.log('Visit https://console.firebase.google.com to view your data.\n');
}

seedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  });
