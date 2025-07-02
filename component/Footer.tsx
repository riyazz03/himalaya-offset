"use client";

import React, { useState } from "react";
// import "../css/footer.css";
import Image from "next/image";
import Link from "next/link";
import MobileFooter from "./mobilefooter";
import "../styles/footer.css"

const MobileFooterData = [
    {
        question: "Quick Links",
        answer: "Home",
        answer2: "Our Courses",
        answer3: "About us",
        answer5: "Contact us",
        links: "/",
        links2: "/our-course",
        links3: "/about-us",
        links4: "/book-your-demo",
        links5: "/contact-us",
    },
    {
        question: "Our Courses",
        answer: "Quran Recitation",
        answer2: "Simplified Tajweed",
        answer3: "Quran Memorization",
        answer4: "Tafseer-Ul-Quran",
        answer5: "Tafseer-Ul-Quran",
        links: "/course-details/quran-recitation",
        links2: "/course-details/simplified-tajweed",
        links3: "/course-details/quran-memorization",
        links4: "",
        links5: "",
    },
    {
        question: "Support & Policies",
        answer: "Cancellation Policy",
        answer2: "Terms & Conditions",
        answer3: "Privacy Policy",
        answer4: "Privacy Policy",
        answer5: "Privacy Policy",
        links: "/contact-us",
        links2: "/contact-us",
        links3: "/contact-us",
        links4: "",
        links5: "",
    },
];

const Footer = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    return (
        <>
            <div className="empty-footer-page"></div>
            <div className="footer">
                <div className="footer-section">
                    <div className="footer-logo-image">
                        <Link href="/">
                            <Image
                                src="/Images/footer-logo.svg"
                                alt="footer-logo"
                                className="footer-logo"
                                height={62}
                                width={105}
                            />
                        </Link>
                    </div>
                    <div className="footer-content-block">
                        <div className="footer-content-links-block">
                            {" "}
                            {/*First link div */}
                            <h4 className="footer-content-link-title">Quick Links</h4>
                            <div className="footer-content-links-wrapper-div">
                                <Link href="/" className="footer-link">
                                    Home
                                </Link>
                                <Link href="/our-course" className="footer-link">
                                    Our Courses
                                </Link>
                                <Link href="/about-us" className="footer-link">
                                    About us
                                </Link>
                                <Link href="/contact-us" className="footer-link">
                                    Contact us
                                </Link>
                            </div>
                        </div>{" "}
                        {/*End of First LInk div */}
                        <div className="footer-content-links-block">
                            {" "}
                            {/*second link div */}
                            <h4 className="footer-content-link-title">Our Courses</h4>
                            <div className="footer-content-links-wrapper-div">
                                <Link
                                    href="/course-details/quran-recitation"
                                    className="footer-link"
                                >
                                    Quran Recitation
                                </Link>
                                <Link
                                    href="/course-details/simplified-tajweed"
                                    className="footer-link"
                                >
                                    Simplified Tajweed
                                </Link>
                                <Link
                                    href="/course-details/quran-memorization"
                                    className="footer-link"
                                >
                                    Quran Memorization
                                </Link>
                            </div>
                        </div>{" "}
                        {/*End of second LInk div */}
                        {/*third link div */}
                        {/* <div className="footer-content-links-block">
              <h4 className="footer-content-link-title">Support & Policies</h4>
              <div className="footer-content-links-wrapper-div">
                <Link href="/" className="footer-link">
                  Cancellation Policy
                </Link>
                <Link href="/" className="footer-link">
                  Terms & Conditions
                </Link>
                <Link href="/" className="footer-link">
                  Privacy Policy
                </Link>
              </div>
            </div> */}
                        {/*End of third LInk div */}
                        <div className="footer-content-links-block">
                            {" "}
                            {/*fourth link div */}
                            <h4 className="footer-content-link-title">Connect Now</h4>
                            <div className="footer-content-links-wrapper-div">
                                <a
                                    href="mailto:onlinetaleemulquranvlr@gmail.com"
                                    className="footer-link"
                                >
                                    onlinetaleemulquranvlr@gmail.com
                                </a>
                                <a href="tel:+919087078760" className="footer-link">
                                    +91 9087078760 <span className="only-whatsapp">(Only Whatsapp)</span>
                                </a>
                                <a href="tel:+919360771659" className="footer-link">
                                    +919360771659 <span className="only-whatsapp">(Only Whatsapp)</span>
                                </a>

                                <div className="footer-social-media-icon-block">
                                    <Image
                                        src="/assets/social-media-icons/whatsapp.svg"
                                        alt="whatsapp"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                    <Image
                                        src="/assets/social-media-icons/facebook.svg"
                                        alt="facebook"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                    <Image
                                        src="/assets/social-media-icons/x.svg"
                                        alt="x"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                </div>
                            </div>
                        </div>
                        {/*End of fourth LInk div */}
                        {/* <a href="mailto:crayontofficial@gmail.com">
                            <div className="crayont-div">
                                <h3 className="crayont-text">Crafted by Crayont</h3>
                                <Image
                                    src="/Images/crayont-logo.png"
                                    alt="crayont logo"
                                    width={28}
                                    height={31}
                                    className="crayont-logo"
                                />
                            </div>
                        </a> */}
                    </div>
                    <div className="footer-links-block">
                        {MobileFooterData.map((item, index) => (
                            <MobileFooter
                                key={index}
                                question={item.question}
                                answer={item.answer}
                                answer2={item.answer2}
                                answer3={item.answer3}
                                answer4={item.answer4}
                                answer5={item.answer5}
                                links={item.links}
                                links2={item.links2}
                                links3={item.links3}
                                links4={item.links4}
                                links5={item.links5}
                                isOpen={openIndex === index} // Pass the state to MobileFooter
                                onClick={() => setOpenIndex(openIndex === index ? null : index)} // Toggle state on click
                            />
                        ))}

                        <div className="footer-content-links-block connect-now-block">
                            <h4 className="footer-content-link-title">Connect Now</h4>
                            <div className="footer-content-links-wrapper-div">
                                <div className="footer-social-media-icon-block-mobile">
                                    <a
                                        href="mailto:onlinetaleemulquranvlr@gmail.com"
                                        className="footer-link"
                                    >
                                        onlinetaleemulquranvlr@gmail.com
                                    </a>
                                    <a href="tel:+919087078760" className="footer-link">
                                        +91 9087078760 <span className="only-whatsapp">(Only Whatsapp)</span>
                                    </a>
                                    <a href="tel:+919360771659" className="footer-link">
                                        +919360771659 <span className="only-whatsapp">(Only Whatsapp)</span>
                                    </a>

                                </div>
                                <div className="footer-social-media-icon-block">
                                    <Image
                                        src="/assets/social-media-icons/whatsapp.svg"
                                        alt="whatsapp"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                    <Image
                                        src="/assets/social-media-icons/facebook.svg"
                                        alt="facebook"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                    <Image
                                        src="/assets/social-media-icons/x.svg"
                                        alt="x"
                                        width={40}
                                        height={40}
                                        className="footer-social-media-icons"
                                    />
                                </div>
                            </div>
                        </div>
                        <a href="mailto:crayontofficial@gmail.com">
                            <div className="crayont-div footer-logo-div">
                                <h3 className="crayont-text">Crafted by Crayont</h3>
                                <Image
                                    src="/Images/crayont-logo.png"
                                    alt="crayont logo"
                                    width={28}
                                    height={31}
                                    className="crayont-logo"
                                />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
