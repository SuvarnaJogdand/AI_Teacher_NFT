import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";


function Statistics() {

    const { signer } = useWallet();

    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalSales: 0,
        totalViews: 0
    });


    useEffect(() => {

        loadStatistics();

    }, [signer]);


    const loadStatistics = async () => {

        try {

            if (!signer) return;


            const contract =
                new ethers.Contract(
                    NFT_CONTRACT,
                    abi.abi,
                    signer
                );


            const totalSupply =
                await contract.getTotalSupply();


            setStats({

                totalTeachers:
                    Number(totalSupply),

                totalSales: 0,

                totalViews: 0

            });


        }
        catch(error) {

            console.error(
                "Statistics Error:",
                error
            );

        }

    };


    return (

        <div className="container">


            <h1>
                Platform Statistics
            </h1>


            <div className="stats-grid">


                <div className="stats-card">

                    <h2>
                        AI Teachers
                    </h2>

                    <p>
                        {stats.totalTeachers}
                    </p>

                </div>



                <div className="stats-card">

                    <h2>
                        Total Sales
                    </h2>

                    <p>
                        {stats.totalSales}
                    </p>

                </div>



                <div className="stats-card">

                    <h2>
                        Total Views
                    </h2>

                    <p>
                        {stats.totalViews}
                    </p>

                </div>


            </div>


        </div>

    );

}


export default Statistics;