import React from 'react';
import { motion } from 'framer-motion';


export default function Loading() {
return (
<div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 z-50">
<motion.div
className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
animate={{ rotate: 360 }}
transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
/>
<motion.p
className="mt-6 text-lg font-semibold"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
>
A carregar Appicarta...
</motion.p>
</div>
);
}