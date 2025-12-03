// import { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const WPMenuSync = () => {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const slugToPathMap = {
//         'gamify': '/',
//         'gamify-points': '/points',
//         'gamify-achievements': '/achievements',
//         'gamify-levels': '/levels',
//         'gamify-logs': '/logs',
//         'gamify-leaderboards': '/leaderboards',
//         'gamify-settings': '/settings',
//     };

//     useEffect(() => {

//         const adminMenuLinks = document.querySelectorAll('#toplevel_page_gamify a');

//         const handleMenuClick = (event) => {

//             event.preventDefault();

//             const url = new URL(event.currentTarget.href);
//             const pageSlug = url.searchParams.get('page');


//             const newPath = slugToPathMap[pageSlug] || '/';


//             if (location.pathname !== newPath) {
//                 navigate(newPath);
//             }
//         };

//         adminMenuLinks.forEach(link => {
//             link.addEventListener('click', handleMenuClick);
//         });

//         return () => {
//             adminMenuLinks.forEach(link => {
//                 link.removeEventListener('click', handleMenuClick);
//             });
//         };
//     }, [navigate, location.pathname]);

//     useEffect(() => {
//         const currentPath = location.pathname;
//         const parentMenu = document.querySelector('#toplevel_page_gamify');


//         parentMenu.querySelectorAll('li').forEach(li => li.classList.remove('current'));


//         for (const slug in slugToPathMap) {
//             if (slugToPathMap[slug] === currentPath) {
//                 const link = parentMenu.querySelector(`a[href$="page=${slug}"]`);
//                 if (link && link.parentElement) {
//                     link.parentElement.classList.add('current');
//                 }
//                 break;
//             }
//         }
//     }, [location.pathname]);

//     return null;
// };

// export default WPMenuSync;